import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = 'https://iqljrteyaegfhrwozdhe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbGpydGV5YWVnZmhyd296ZGhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzMzNDYsImV4cCI6MjA4MjY0OTM0Nn0.rBPVKlkSSj2DFk4SeM3-ptmA0Z3QOB1TJelKlJiLdic';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
