import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Simple in-memory storage for SSR / environments without window
const memoryStorage: Record<string, string> = {};
const fallbackStorage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => { memoryStorage[key] = value; },
  removeItem: (key: string) => { delete memoryStorage[key]; },
};

// Check if we're in a browser/client environment
const isClient = typeof window !== 'undefined';

let storageAdapter: any = fallbackStorage;

if (isClient) {
  try {
    // Use AsyncStorage only on client side
    const AsyncStorageModule = require('@react-native-async-storage/async-storage');
    storageAdapter = AsyncStorageModule.default || AsyncStorageModule;
  } catch {
    storageAdapter = fallbackStorage;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: isClient,
    detectSessionInUrl: false,
  },
});
