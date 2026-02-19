import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Demo mode - allow switching roles without real auth
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (profile) {
            setState({
              user: profile,
              isAuthenticated: true,
              isAdmin: profile.role === 'admin',
              isLoading: false,
              error: null,
            });
            setDemoMode(false);
            return;
          }
        }
      } catch (e) {
        // Silent fail - use demo mode
      }
      
      // No session found — remain unauthenticated
setState({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  error: null,
});
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          setState({
            user: profile,
            isAuthenticated: true,
            isAdmin: profile.role === 'admin',
            isLoading: false,
            error: null,
          });
          setDemoMode(false);
        }
      } else if (event === 'SIGNED_OUT') {
  setState({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    error: null,
  });
}

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: e.message }));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: UserRole = 'standard') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          email,
          full_name: fullName,
          role,
        });
      }
    } catch (e: any) {
      setState(prev => ({ ...prev, isLoading: false, error: e.message }));
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
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


