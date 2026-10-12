import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pufyeabrvrlikbgkjplz.supabase.co';
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZnllYWJydnJsaWtiZ2tqcGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NDYxMjEsImV4cCI6MjEwNzMyMjEyMX0.y3LaWGRiKJSdTDBOL58BsSlwkFObuQS1O7zq7Zu_unY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});
