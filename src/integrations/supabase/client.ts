
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { UserRole } from '@/types/models';

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
  console.log("SignUp function called with:", { email, userData });
  
  try {
    // First, create the auth user
    const authResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    console.log("Auth response:", authResponse);
    
    if (authResponse.error) {
      console.error("Auth error:", authResponse.error);
      return authResponse;
    }
    
    // If auth user was created successfully, manually create the profile
    // This ensures the profile is created regardless of trigger success/failure
    if (authResponse.data?.user?.id) {
      try {
        // Create profile entry manually
        console.log("Creating profile for user:", authResponse.data.user.id);
        const profileResponse = await supabase.from('profiles').insert({
          id: authResponse.data.user.id,
          full_name: userData.full_name || null,
          role: userData.role || 'Customer'
        });
        
        console.log("Profile creation response:", profileResponse);
        
        if (profileResponse.error) {
          console.error("Profile creation error:", profileResponse.error);
        }
        
        // Validate and get the role as a proper enum value
        const role = validateUserRole(userData.role || 'Customer');
        console.log("Creating user_role for user:", authResponse.data.user.id, "with role:", role);
        
        // Use a raw SQL query to ensure proper enum typing
        const roleResponse = await supabase.rpc('create_user_role', {
          p_user_id: authResponse.data.user.id,
          p_role: role
        });
        
        console.log("Role creation response:", roleResponse);
        
        if (roleResponse.error) {
          console.error("Role creation error:", roleResponse.error);
        }
      } catch (error) {
        console.error("Error in manual profile/role creation:", error);
        // We continue even if this fails, as the auth user was created
      }
    }
    
    return authResponse;
  } catch (error) {
    console.error("Error in signUp function:", error);
    return { data: null, error: { message: "An unexpected error occurred during signup." } };
  }
};

// Helper function to validate and convert string role to UserRole type
function validateUserRole(role: string): UserRole {
  const validRoles: UserRole[] = [
    "SuperAdmin", 
    "Admin", 
    "SupportStaff", 
    "ServiceCenterStaff", 
    "CarOwner", 
    "Customer"
  ];
  
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  
  // Default to Customer if invalid role provided
  console.warn(`Invalid role "${role}" provided, defaulting to "Customer"`);
  return "Customer";
}

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
