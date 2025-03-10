
import { supabase } from "./client";
import type { Database } from "./types";
import { RentalPeriod, DeliveryOption } from "@/types/models";

type Booking = Database["public"]["Tables"]["bookings"]["Insert"];

// Create a new booking
export const createBooking = async (bookingData: {
  car_id: string;
  rental_period: RentalPeriod;
  start_date: string;
  end_date: string;
  delivery_option: DeliveryOption;
  delivery_address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  delivery_fee: number;
  deposit: number;
  total_price: number;
}) => {
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) {
    return { 
      data: null, 
      error: { message: "You must be logged in to create a booking" } 
    };
  }

  const booking: Booking = {
    car_id: bookingData.car_id,
    customer_id: user.data.user.id,
    rental_period: bookingData.rental_period,
    start_date: bookingData.start_date,
    end_date: bookingData.end_date,
    delivery_option: bookingData.delivery_option,
    delivery_address: bookingData.delivery_address || null,
    delivery_fee: bookingData.delivery_fee,
    deposit: bookingData.deposit,
    total_price: bookingData.total_price,
    status: "Pending",
    payment_status: "Pending"
  };

  return supabase.from("bookings").insert(booking);
};

// Get all bookings for the current user
export const getUserBookings = async () => {
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) {
    return { 
      data: null, 
      error: { message: "You must be logged in to view bookings" } 
    };
  }

  return supabase
    .from("bookings")
    .select(`
      *,
      cars (*)
    `)
    .eq("customer_id", user.data.user.id)
    .order("created_at", { ascending: false });
};

// Report an incident for a booking
export const reportIncident = async (
  bookingId: string,
  incidentDetails: {
    details: string;
    photos?: string[];
  }
) => {
  const user = await supabase.auth.getUser();
  
  if (!user.data.user) {
    return { 
      data: null, 
      error: { message: "You must be logged in to report an incident" } 
    };
  }

  // First verify the booking belongs to the current user
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("customer_id", user.data.user.id)
    .single();

  if (bookingError || !booking) {
    return { 
      data: null, 
      error: { message: "Booking not found or you do not have permission" } 
    };
  }

  // Update the booking with incident information
  return supabase
    .from("bookings")
    .update({
      incident_reported: true,
      incident_details: incidentDetails.details,
      incident_photos: incidentDetails.photos || [],
      incident_timestamp: new Date().toISOString(),
      incident_status: "Pending"
    })
    .eq("id", bookingId);
};

// Calculate delivery fee based on distance and time
export const calculateDeliveryFee = async (
  pickupLocation: string,
  deliveryLocation: string,
  deliveryTime: Date
) => {
  return supabase.rpc("get_delivery_fee", {
    pickup_location: pickupLocation,
    delivery_location: deliveryLocation,
    delivery_time: deliveryTime.toISOString()
  });
};
