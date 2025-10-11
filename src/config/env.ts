import Constants from 'expo-constants';

const extra = (Constants.expoConfig || (Constants as any).manifest)?.extra || {};

export const SUPABASE_URL: string = extra.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY: string = extra.SUPABASE_ANON_KEY || '';

export function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[env] Missing SUPABASE_URL or SUPABASE_ANON_KEY. API calls will be disabled.');
  }
}
