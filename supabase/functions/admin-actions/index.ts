
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the JWT from the request to check auth
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No authorization token provided' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user has proper authorization
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's role from the profiles table
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has admin access
    const role = profileData.role;
    const isAdmin = role === 'Admin' || role === 'SuperAdmin';
    const isSupportStaff = role === 'SupportStaff';

    if (!isAdmin && !isSupportStaff) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Now process the request based on the action
    const { action, ...data } = await req.json();

    let result;
    console.log(`Processing admin action: ${action}`);

    switch (action) {
      case 'approveCar':
        // Only Admins can approve cars
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Only Admins can approve cars' }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Update car status to Available
        const { data: carData, error: carError } = await supabaseClient
          .from('cars')
          .update({ status: 'Available' })
          .eq('id', data.carId)
          .eq('status', 'New') // Only update if current status is 'New'
          .select()
          .single();
          
        if (carError) {
          console.error('Error approving car:', carError);
          return new Response(
            JSON.stringify({ error: 'Failed to approve car' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        result = { message: 'Car approved successfully', car: carData };
        break;
        
      case 'rejectCar':
        // Only Admins can reject cars
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Only Admins can reject cars' }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Update car status to Rejected
        const { data: rejectedCarData, error: rejectError } = await supabaseClient
          .from('cars')
          .update({ status: 'Rejected' })
          .eq('id', data.carId)
          .eq('status', 'New') // Only update if current status is 'New'
          .select()
          .single();
          
        if (rejectError) {
          console.error('Error rejecting car:', rejectError);
          return new Response(
            JSON.stringify({ error: 'Failed to reject car' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        result = { message: 'Car rejected successfully', car: rejectedCarData };
        break;
        
      case 'approveBooking':
        // Only Admins can approve bookings
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: 'Only Admins can approve bookings' }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Update booking status to Approved
        const { data: bookingData, error: bookingError } = await supabaseClient
          .from('bookings')
          .update({ status: 'Approved' })
          .eq('id', data.bookingId)
          .eq('status', 'Pending') // Only update if current status is 'Pending'
          .select()
          .single();
          
        if (bookingError) {
          console.error('Error approving booking:', bookingError);
          return new Response(
            JSON.stringify({ error: 'Failed to approve booking' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        result = { message: 'Booking approved successfully', booking: bookingData };
        break;
        
      case 'completeChecklist':
        // Both Admins and Support Staff can complete checklists
        // Process checklist completion logic here
        result = { message: 'Checklist completed successfully' };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
