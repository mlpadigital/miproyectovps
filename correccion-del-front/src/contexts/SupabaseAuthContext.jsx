import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const SupabaseAuthContext = createContext(undefined);

export const SupabaseAuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          membership_plans (
            name,
            features
          )
        `)
        .eq('id', userId)
        .maybeSingle(); // 1. Mantiene la app estable sin lanzar excepciones fatales

      if (error) {
        console.warn('Atención al cargar perfil:', error.message);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    if (currentSession?.user) {
      // 2. Carga el perfil sin bloquear el inicio de sesión si falla la BD
      const userProfile = await fetchProfile(currentSession.user.id);
      setUser({ ...currentSession.user, profile: userProfile || null });
    } else {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (isMounted) handleSession(session);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      const error = { message: "El formato del correo electrónico no es válido." };
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: error.message,
      });
      return { error };
    }

    if (options?.data) {
      const { plan_id } = options.data;
      if (plan_id === '') {
        options.data.plan_id = null;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: error.message || "Algo salió mal",
      });
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (loginIdentifier, password) => {
    // 3. Sanitiza el mail ingresado
    const trimmedEmail = loginIdentifier.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      let friendlyMessage = error.message;

      if (error.message.includes('Invalid login credentials')) {
        friendlyMessage = "El correo electrónico o la contraseña son incorrectos.";
      } else if (error.message.includes('Email not confirmed')) {
        friendlyMessage = "Debes confirmar tu correo electrónico antes de ingresar.";
      }

      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: friendlyMessage,
      });

      return { error: { ...error, message: friendlyMessage } };
    }

    return { data, error: null };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
    }
    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    profile,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id)
  }), [user, session, loading, profile, signUp, signIn, signOut]);

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};