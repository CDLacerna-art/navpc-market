import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { mockEngine, DEMO_PROFILES } from '../services/mockEngine';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('buyer');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Check current Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id);
        } else {
          loadDemoMode();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id);
        } else {
          loadDemoMode();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      loadDemoMode();
    }
  }, []);

  const loadDemoMode = () => {
    setIsDemoMode(true);
    const initialProfile = mockEngine.getCurrentProfile();
    setUser({ id: initialProfile.id, email: initialProfile.email });
    setProfile(initialProfile);
    setRole(initialProfile.role);
    setIsLoading(false);
  };

  const fetchSupabaseProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
        setRole(data.role || 'buyer');
      }
    } catch (err) {
      console.warn('Failed to fetch profile from Supabase, falling back to demo role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole) => {
    if (DEMO_PROFILES[newRole]) {
      const updatedProfile = mockEngine.setActiveRole(newRole);
      setProfile(updatedProfile);
      setRole(newRole);
      setUser({ id: updatedProfile.id, email: updatedProfile.email });
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    loadDemoMode();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isDemoMode,
        isLoading,
        switchRole,
        logout,
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
