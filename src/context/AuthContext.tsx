import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { initialAdminUser, initialUser } from '../data/initialData';
import { storageService } from '../services/storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User;
  role: UserRole;
  isAdmin: boolean;
  hasSupabaseAuth: boolean;
  isLoading: boolean;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerAdmin: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('ce_portal_admin_session') === 'true';
  });
  const [hasSupabaseAuth, setHasSupabaseAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>(() => {
    return isAdmin ? initialAdminUser : initialUser;
  });

  // Check Supabase session on startup
  useEffect(() => {
    async function checkSession() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsAdmin(true);
            setHasSupabaseAuth(true);
            setUser({
              ...initialAdminUser,
              email: session.user.email || initialAdminUser.email,
              name: session.user.user_metadata?.name || initialAdminUser.name,
            });
            localStorage.setItem('ce_portal_admin_session', 'true');
          } else {
            setHasSupabaseAuth(false);
            const localSession = localStorage.getItem('ce_portal_admin_session') === 'true';
            setIsAdmin(localSession);
            setUser(localSession ? initialAdminUser : initialUser);
          }
        } else {
          setHasSupabaseAuth(false);
          const localSession = localStorage.getItem('ce_portal_admin_session') === 'true';
          setIsAdmin(localSession);
          setUser(localSession ? initialAdminUser : initialUser);
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();

    // Listen for auth state changes if Supabase is connected
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAdmin(true);
          setHasSupabaseAuth(true);
          setUser({
            ...initialAdminUser,
            email: session.user.email || initialAdminUser.email,
            name: session.user.user_metadata?.name || initialAdminUser.name,
          });
          localStorage.setItem('ce_portal_admin_session', 'true');
        } else {
          setHasSupabaseAuth(false);
          const localSession = localStorage.getItem('ce_portal_admin_session') === 'true';
          setIsAdmin(localSession);
          setUser(localSession ? initialAdminUser : initialUser);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const loginAsAdmin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.session) {
          setIsAdmin(true);
          setHasSupabaseAuth(true);
          setUser({
            ...initialAdminUser,
            email: data.session.user.email || email,
            name: data.session.user.user_metadata?.name || initialAdminUser.name,
          });
          localStorage.setItem('ce_portal_admin_session', 'true');
          setIsLoading(false);
          return { success: true };
        }

        // If specific Supabase error and not matching demo password, report error
        if (error && password !== 'admin123') {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
      }

      // Demo/Fallback login check
      // Allows sign-in with designated credentials for demonstration or offline preview
      if (
        (email.toLowerCase() === 'admin@civilportal.edu' && password === 'admin123') ||
        (email.toLowerCase() === 'admin@elcivilo.edu' && password === 'admin123')
      ) {
        setIsAdmin(true);
        setHasSupabaseAuth(false);
        setUser({
          ...initialAdminUser,
          email: email || initialAdminUser.email,
        });
        localStorage.setItem('ce_portal_admin_session', 'true');
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid admin credentials. Use admin@civilportal.edu / admin123 for demo, or sign in with your Supabase Admin account.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication error' };
    }
  };

  const registerAdmin = async (
    email: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || 'Faculty Admin',
            role: 'admin',
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setIsAdmin(true);
        setHasSupabaseAuth(true);
        setUser({
          ...initialAdminUser,
          email: data.session.user.email || email,
          name: name || initialAdminUser.name,
        });
        localStorage.setItem('ce_portal_admin_session', 'true');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logoutAdmin = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setIsAdmin(false);
      setHasSupabaseAuth(false);
      setUser(initialUser);
      localStorage.removeItem('ce_portal_admin_session');
      setIsLoading(false);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updated };
      storageService.saveUser(newUser);
      return newUser;
    });
  };

  const toggleRole = () => {
    setIsAdmin((prev) => {
      const next = !prev;
      localStorage.setItem('ce_portal_admin_session', String(next));
      setUser(next ? initialAdminUser : initialUser);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: isAdmin ? 'admin' : 'student',
        isAdmin,
        hasSupabaseAuth,
        isLoading,
        loginAsAdmin,
        registerAdmin,
        logoutAdmin,
        updateUser,
        toggleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
