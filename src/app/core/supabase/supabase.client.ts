import { createClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

const supabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

export function createSupabaseClient() {
  return supabaseClient;
}
