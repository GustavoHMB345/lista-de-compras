import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertEnv } from '../config/env';

assertEnv();

type StorageLike = {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
};

const rnStorage: StorageLike = {
  getItem(key: string) {
    return Promise.resolve(globalThis?.localStorage?.getItem(key) ?? null);
  },
  setItem(key: string, value: string) {
    return Promise.resolve(globalThis?.localStorage?.setItem(key, value));
  },
  removeItem(key: string) {
    return Promise.resolve(globalThis?.localStorage?.removeItem(key));
  },
};

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, storage: rnStorage as any },
      })
    : (null as any);
