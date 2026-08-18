import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://jgdtqfzotqelqvmmxhlt.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHRxZnpvdHFlbHF2bW14aGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExNTQ0MzUsImV4cCI6MjAzNjczNDQzNX0.KJ-X2V6lEu_GbGvK5qR9_YXvYVWlp3ZKz0J-qXyKYUE";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase credentials");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
