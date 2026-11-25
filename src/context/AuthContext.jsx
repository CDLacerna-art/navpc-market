import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { mockEngine, DEMO_PROFILES } from '../services/mockEngine';

const AuthContext = createContext(null);

export const ALLOWED_EMAIL_DOMAIN = 'navotaspolytechniccollege.edu.ph';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo mode is only enabled if explicitly configured and there is no live Supabase user
  const demoFlag = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper to fetch profile strictly from database profiles table
  const fetchProfileFromDb = useCallback(async (userId) => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile from database:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  }, []);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: initialSession }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (initialSession?.user && mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            const userProfile = await fetchProfileFromDb(initialSession.user.id);
            if (mounted) {
              setProfile(userProfile);
              setRole(userProfile?.role || 'buyer');
              setIsDemoMode(false);
              setIsLoading(false);
            }
            return;
          }
        } catch (err) {
          console.warn('Supabase session initialization warning:', err.message);
        }
      }

      // No active Supabase session
      if (mounted) {
        if (demoFlag && !isSupabaseConfigured) {
          setIsDemoMode(true);
          const demoUser = mockEngine.getCurrentProfile();
          setUser({ id: demoUser.id, email: demoUser.email });
          setProfile(demoUser);
          setRole(demoUser.role);
        } else {
          // Logged-out state
          setIsDemoMode(false);
          setUser(null);
          setProfile(null);
          setRole(null);
          setSession(null);
        }
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsDemoMode(false);
          const userProfile = await fetchProfileFromDb(currentSession.user.id);
          if (mounted) {
            setProfile(userProfile);
            setRole(userProfile?.role || 'buyer');
            setIsLoading(false);
          }
        } else {
          // Signed out
          setUser(null);
          setProfile(null);
          setRole(null);
          setSession(null);
          if (demoFlag && !isSupabaseConfigured) {
            setIsDemoMode(true);
            const demoUser = mockEngine.getCurrentProfile();
            setUser({ id: demoUser.id, email: demoUser.email });
            setProfile(demoUser);
            setRole(demoUser.role);
          } else {
            setIsDemoMode(false);
          }
          setIsLoading(false);
        }
      });
      subscription = data?.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [demoFlag, fetchProfileFromDb]);

  // Client-side Registration (always creates buyers)
  const register = async ({ fullName, email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    // Friendly domain validation
    const emailParts = email.toLowerCase().trim().split('@');
    const domain = emailParts[emailParts.length - 1];
    if (domain !== ALLOWED_EMAIL_DOMAIN) {
      throw new Error(`Only official school email addresses (@${ALLOWED_EMAIL_DOMAIN}) are eligible to register.`);
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      // Map raw Supabase errors to friendly messages
      if (error.message.includes('User already registered') || error.status === 422) {
        throw new Error('An account with this school email already exists. Please sign in instead.');
      }
      if (error.message.includes('rate limit') || error.status === 429) {
        throw new Error('Too many registration attempts. Please wait a few minutes before trying again.');
      }
      if (error.message.includes('Password should be')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      if (error.message.includes('domain') || error.message.includes('institutional')) {
        throw new Error(`Registration rejected: Email domain must be exactly @${ALLOWED_EMAIL_DOMAIN}`);
      }
      throw new Error(error.message || 'Registration could not be completed. Please check your credentials and try again.');
    }

    return data;
  };

  // Client-side Login
  const login = async ({ email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid school email or password. Please try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Your email address has not been confirmed yet. Please check your school inbox for the verification link.');
      }
      if (error.message.includes('rate limit') || error.status === 429) {
        throw new Error('Too many login attempts. Please wait a few minutes before retrying.');
      }
      throw new Error(error.message || 'Login failed. Please verify your credentials.');
    }

    return data;
  };

  // Client-side Logout
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setRole(null);
    setSession(null);
    if (demoFlag && !isSupabaseConfigured) {
      setIsDemoMode(true);
      const demoUser = mockEngine.getCurrentProfile();
      setUser({ id: demoUser.id, email: demoUser.email });
      setProfile(demoUser);
      setRole(demoUser.role);
    } else {
      setIsDemoMode(false);
    }
  };

  // Demo role switcher — disabled if real user or demoFlag=false
  const switchRole = (newRole) => {
    if (!demoFlag || user?.aud === 'authenticated') return;
    if (DEMO_PROFILES[newRole]) {
      const updatedProfile = mockEngine.setActiveRole(newRole);
      setProfile(updatedProfile);
      setRole(newRole);
      setUser({ id: updatedProfile.id, email: updatedProfile.email });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        session,
        isDemoMode,
        isLoading,
        demoFlag,
        register,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
