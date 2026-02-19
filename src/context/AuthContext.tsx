import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const applyUnauthed = () => {
      if (!mounted) return;
      setState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        error: null,
      });
    };

    const applyProfile = (profile: UserProfile) => {
      if (!mounted) return;
      setState({
        user: profile,
        isAuthenticated: true,
        isAdmin: profile.role === 'admin',
        isLoading: false,
        error: null,
      });
    };

    const loadProfile = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        applyUnauthed();
        return;
      }
      applyProfile(profile as UserProfile);
    };

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await loadProfile(session.user.id);
        } else {
          applyUnauthed();
        }
      } catch {
        applyUnauthed();
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user?.id) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          applyUnauthed();
        }
      } catch {
        applyUnauthed();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // auth listener will load profile + set state
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: e?.message || 'Sign in failed' }));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: UserRole = 'standard') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user?.id) {
        const { error: insErr } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          email,
          full_name: fullName,
          role,
        });
        if (insErr) throw insErr;
      }

      // session may not be active immediately depending on email confirmation settings
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: e?.message || 'Sign up failed' }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await supabase.auth.signOut();
      // auth listener will set unauth
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: e?.message || 'Sign out failed' }));
    }
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
