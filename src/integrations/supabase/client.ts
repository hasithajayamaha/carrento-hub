
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqueiogjlyxkmlpgpiwv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxdWVpb2dqbHl4a21scGdwaXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NjI1ODQsImV4cCI6MjA1NzEzODU4NH0.-laj11vrJnUVLTGd7XmQ_dCsj8GbEalWLqpoZvGHiZQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication helpers
export const signUp = async ({ email, password, userData }: { 
  email: string; 
  password: string; 
  userData: { 
    full_name?: string;
    role?: string;
  }
}) => {
  // First, create the auth user
  const authResponse = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  
  if (authResponse.error) {
    return authResponse;
  }
  
  // If auth user was created successfully but we need to manually create the profile
  // because of the SQL error with the trigger
  if (authResponse.data?.user?.id) {
    try {
      // Create profile entry manually
      await supabase.from('profiles').insert({
        id: authResponse.data.user.id,
        full_name: userData.full_name || null,
        role: userData.role || 'Customer'
      });
    } catch (error) {
      console.error("Error creating profile:", error);
      // We continue even if this fails, as the auth user was created
    }
  }
  
  return authResponse;
};

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  return supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return supabase.auth.getUser();
};

export const getUserProfile = async (userId: string) => {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
};

// Cars related helpers
export const getAvailableCars = async (filters?: any) => {
  let query = supabase
    .from('cars')
    .select('*')
    .eq('status', 'Available');
  
  if (filters) {
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.minYear) query = query.gte('year', filters.minYear);
    if (filters.maxYear) query = query.lte('year', filters.maxYear);
  }
  
  return query;
};

export const getCarById = async (carId: string) => {
  return supabase
    .from('cars')
    .select('*, profiles!inner(*)')
    .eq('id', carId)
    .single();
};

// Booking related helpers
export const createBooking = async (bookingData: any) => {
  return supabase
    .from('bookings')
    .insert(bookingData);
};

export const getUserBookings = async (userId: string) => {
  return supabase
    .from('bookings')
    .select('*, cars(*)')
    .eq('customer_id', userId);
};
