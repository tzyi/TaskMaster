import React, { createContext, useContext, useEffect, useState } from 'react';
import { authHelpers } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    authHelpers.getCurrentUser().then(({ user, error }) => {
      if (!error && user) {
        setUser(user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const result = await authHelpers.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signUp = async (email, password, metadata) => {
    setLoading(true);
    const result = await authHelpers.signUp(email, password, metadata);
    setLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const result = await authHelpers.signInWithGoogle();
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authHelpers.signOut();
    if (!result.error) {
      setUser(null);
      setSession(null);
    }
    setLoading(false);
    return result;
  };

  const resetPassword = async (email) => {
    return await authHelpers.resetPassword(email);
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};