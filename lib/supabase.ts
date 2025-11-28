import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Better to use environment variables in a real app
const SUPABASE_URL = 'https://gbwgmzfywdaodurpbkmf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdid2dtemZ5d2Rhb2R1cnBia21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTQ4NjEsImV4cCI6MjA3OTgzMDg2MX0.UPxoxUm9fUB3t5Y6wNZcL3FmVOFFad2xWHdJHJos1zA';

// Custom storage adapter for Expo SecureStore
import { Platform } from 'react-native';

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') return null;
            return localStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(key, value);
            return;
        }
        SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof localStorage === 'undefined') return;
            localStorage.removeItem(key);
            return;
        }
        SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: ExpoSecureStoreAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
