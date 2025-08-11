'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      setLoading(true);
      console.log('AuthContext: Checking authentication...');
      const response = await authApi.me();
      console.log('AuthContext: User authenticated:', response);
      setUser(response);
    } catch (error) {
      console.log('AuthContext: User not authenticated:', error);
      setUser(null);
      // Don't redirect here, let individual pages handle it
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('AuthContext: Authentication check completed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('AuthContext: Attempting login...');
      const response = await authApi.login({ email, password });
      console.log('AuthContext: Login successful:', response);
      setUser(response);
      router.push('/dashboard');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state
      setUser(null);
      router.push('/');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading: loading || !initialized, // Show loading until we've checked auth
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
