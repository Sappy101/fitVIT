import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  diet_preference: string | null;
  admin: boolean | null;
  auth_user_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, email?: string | null) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/profile?auth_user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfile(data);
          return data;
        }
      }
      // Create profile if not found
      const createRes = await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: userId,
          email: email || '',
          full_name: email?.split('@')[0] || 'User',
        }),
      });
      if (createRes.ok) {
        const newProfile = await createRes.json();
        setProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        fetchProfile(s.user.id, s.user.email).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const prof = await fetchProfile(data.user.id, data.user.email);
    const isAdmin = prof?.admin === true || (email || '').toLowerCase().includes('admin');
    return { isAdmin };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await fetch(`${BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: data.user.id,
          email,
          full_name: fullName,
        }),
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session) {
      await fetchProfile(session.user.id, session.user.email);
    }
  };

  const isAdmin = profile?.admin === true || (session?.user?.email || '').toLowerCase().includes('admin');

  return (
    <AuthContext.Provider value={{ session, profile, isAdmin, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
