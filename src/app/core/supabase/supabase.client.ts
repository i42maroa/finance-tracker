import { createClient } from '@supabase/supabase-js';

import { environment } from '../../../environments/environment';

export function createSupabaseClient() {
  return createClient(environment.supabaseUrl, environment.supabaseAnonKey);
}
