'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, LoginData, RegisterData } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setUser(response.data.user);
      
      // Redirect based on user type
      switch (response.data.user.user_type) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'vendor':
          router.push('/vendor/dashboard');
          break;
        case 'customer':
          router.push('/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
      
      // Redirect based on user type
      if (data.user_type === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    const userType = user?.user_type;
    await authService.logout();
    setUser(null);

    // Redirect based on user type
    switch (userType) {
      case 'admin':
        router.push('/admin/login');
        break;
      case 'vendor':
        router.push('/vendor/login');
        break;
      default:
        router.push('/login');
    }
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

