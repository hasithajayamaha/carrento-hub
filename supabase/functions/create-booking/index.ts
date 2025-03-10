
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the auth header
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the request payload
    const { bookingData } = await req.json();

    // Validate required fields
    const requiredFields = [
      'car_id', 'customer_id', 'rental_period', 'start_date', 
      'end_date', 'delivery_option', 'total_price', 'deposit'
    ];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify car is available
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', bookingData.car_id)
      .eq('status', 'Available')
      .single();

    if (carError || !car) {
      return new Response(
        JSON.stringify({ error: 'Car is not available for booking' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate delivery fee if needed
    if (bookingData.delivery_option === 'Delivery') {
      // Here we would calculate delivery fee - for now using provided value
      // In a real app, we would validate address and calculate based on distance
      if (!bookingData.delivery_address) {
        return new Response(
          JSON.stringify({ error: 'Delivery address is required for delivery option' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        car_id: bookingData.car_id,
        customer_id: bookingData.customer_id,
        rental_period: bookingData.rental_period,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        delivery_option: bookingData.delivery_option,
        delivery_address: bookingData.delivery_address || null,
        delivery_fee: bookingData.delivery_fee || 0,
        deposit: bookingData.deposit,
        total_price: bookingData.total_price,
        status: 'Pending',
        payment_status: 'Pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update car status to Booked
    const { error: updateError } = await supabase
      .from('cars')
      .update({ status: 'Booked' })
      .eq('id', bookingData.car_id);

    if (updateError) {
      console.error('Error updating car status:', updateError);
      // Continue anyway, as the booking was created
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, booking }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
