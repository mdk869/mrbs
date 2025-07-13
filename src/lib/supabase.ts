import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ornwnqvcbddjbuuqfhuh.supabase.co'; // Ganti dengan URL projek Mr.K
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybnducXZjYmRkamJ1dXFmaHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDcxNDEsImV4cCI6MjA2Nzk4MzE0MX0.iSGJYVpRgo1JuAldQCScreo3k5trw5Qjn-urXIePKoI';      // Ganti dengan anon/public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
