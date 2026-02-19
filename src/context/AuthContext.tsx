import React, { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  // Single source of truth
  const currentUserIdRef = useRef<string | null>(null);
  const profileRequestRef = useRef<Promise<UserProfile | null> | null>(null);
  const mountedRef = useRef(true);

  const setUnauthed = useCallback(() => {
    currentUserIdRef.current = null;
    profileRequestRef.current = null;

    if (!mountedRef.current) return;

    setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const setAuthed = useCallback((profile: UserProfile) => {
    if (!mountedRef.current) return;

    setState({
      user: profile,
      isAuthenticated: true,
      isAdmin: profile.role === 'admin',
      isLoading: false,
      error: null,
    });
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    // Prevent duplicate loads for same user
    if (currentUserIdRef.current === userId && profileRequestRef.current) {
      return profileRequestRef.current;
    }

    currentUserIdRef.current = userId;

    const request = (async () => {
      try {
        const profile = await fetchProfile(userId);
        return profile;
      } catch (e) {
        console.error('Profile fetch error:', e);
        return null;
      }
    })();

    profileRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const handleSession = async (session: any) => {
      if (!session?.user?.id) {
        setUnauthed();
        return;
      }

      if (!mountedRef.current) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const userId = session.user.id;

      const profile = await loadProfile(userId);

      if (!mountedRef.current) return;

      // If user changed during async call, ignore result
      if (currentUserIdRef.current !== userId) return;

      if (profile) {
        setAuthed(profile);
      } else {
        // Minimal safe fallback
        setAuthed({
          id: userId,
          user_id: userId,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email || '',
          role: 'standard',
          created_at: new Date().toISOString(),
        } as UserProfile);
      }
    };

    // INIT — single execution
    supabase.auth.getSession().then(({ data }) => {
      handleSession(data.session);
    });

    // SINGLE subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, setAuthed, setUnauthed]);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
    }
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'standard'
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return;
    }

    if (data.user?.id) {
      await supabase.from('profiles').upsert({
        user_id: data.user.id,
        email,
        full_name: fullName,
        role,
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
