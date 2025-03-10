
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceLogRequest {
  carId: string;
  type: 'Regular' | 'Repair' | 'Inspection';
  description: string;
  cost: number;
  notes?: string;
  photos?: string[];
  performedBy?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user has permission to log services
    const allowedRoles = ['ServiceCenterStaff', 'Admin', 'SuperAdmin'];
    if (!allowedRoles.includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to log services' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process based on request method
    if (req.method === 'POST') {
      // Create a new service log
      const serviceLogData: ServiceLogRequest = await req.json();
      
      // Validate required fields
      if (!serviceLogData.carId || !serviceLogData.type || !serviceLogData.description) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log the maintenance service
      const { data, error } = await supabase
        .from('maintenance')
        .insert({
          car_id: serviceLogData.carId,
          type: serviceLogData.type,
          description: serviceLogData.description,
          cost: serviceLogData.cost,
          notes: serviceLogData.notes,
          photos: serviceLogData.photos,
          performed_by: serviceLogData.performedBy || user.id,
          date: new Date().toISOString(),
          status: 'Completed'
        })
        .select();
      
      if (error) {
        console.error('Error creating service log:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create service log' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ data, success: true }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (req.method === 'GET') {
      // Get maintenance records with optional filtering
      const url = new URL(req.url);
      const carId = url.searchParams.get('carId');
      const type = url.searchParams.get('type');
      const status = url.searchParams.get('status');
      
      let query = supabase
        .from('maintenance')
        .select(`
          id, type, description, date, status, cost, notes, performed_by, photos,
          cars(id, make, model, year, color, owner_id),
          profiles(full_name)
        `)
        .order('date', { ascending: false });
      
      if (carId) {
        query = query.eq('car_id', carId);
      }
      
      if (type) {
        query = query.eq('type', type);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching maintenance records:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch maintenance records' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ data, success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in service-logging function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
