// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqueiogjlyxkmlpgpiwv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxdWVpb2dqbHl4a21scGdwaXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NjI1ODQsImV4cCI6MjA1NzEzODU4NH0.-laj11vrJnUVLTGd7XmQ_dCsj8GbEalWLqpoZvGHiZQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);