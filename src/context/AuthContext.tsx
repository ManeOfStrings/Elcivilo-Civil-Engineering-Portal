import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { initialAdminUser, initialUser } from '../data/initialData';
import { storageService } from '../services/storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  loginAsAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('ce_portal_admin_session') === 'true';
  });
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
            setUser({
              ...initialAdminUser,
              email: session.user.email || initialAdminUser.email,
              name: session.user.user_metadata?.name || initialAdminUser.name,
            });
            localStorage.setItem('ce_portal_admin_session', 'true');
          } else {
            // Keep local admin session if set for demo, otherwise false
            const localSession = localStorage.getItem('ce_portal_admin_session') === 'true';
            setIsAdmin(localSession);
            setUser(localSession ? initialAdminUser : initialUser);
          }
        } else {
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
          setUser({
            ...initialAdminUser,
            email: session.user.email || initialAdminUser.email,
          });
          localStorage.setItem('ce_portal_admin_session', 'true');
        } else {
          setIsAdmin(false);
          setUser(initialUser);
          localStorage.removeItem('ce_portal_admin_session');
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

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.session) {
          setIsAdmin(true);
          setUser({
            ...initialAdminUser,
            email: data.session.user.email || email,
          });
          localStorage.setItem('ce_portal_admin_session', 'true');
          setIsLoading(false);
          return { success: true };
        }
      }

      // Demo/Fallback login check
      // Allows sign-in with designated credentials for demonstration or offline development
      if (
        (email.toLowerCase() === 'admin@civilportal.edu' && password === 'admin123') ||
        (email.toLowerCase() === 'admin@elcivilo.edu' && password === 'admin123')
      ) {
        setIsAdmin(true);
        setUser({
          ...initialAdminUser,
          email: email || initialAdminUser.email,
        });
        localStorage.setItem('ce_portal_admin_session', 'true');
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid admin credentials. Use admin@civilportal.edu / admin123 for demo.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Authentication error' };
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
        isLoading,
        loginAsAdmin,
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
