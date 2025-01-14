// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterData, AuthResponse, ErrorResponse } from '@/types/auth';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verify token with backend
          const { data } = await api.get<{ user: User }>('/auth/profile');
          setUser(data.user);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const { data } = await api.post<AuthResponse>('/api/auth/login', { 
        email, 
        password 
      });
  
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      
      const storedToken = localStorage.getItem('token');
      console.log('Stored token:', storedToken);
  
      setUser(data.user);
  
      return data;
    } catch (error) {
      // Generic error handling
      console.error('Login error:', error);
      
      // Check if error has a response
      if (error instanceof Error && 'response' in error) {
        const apiError = error as { response?: { data?: ErrorResponse } };
        throw new Error(
          apiError.response?.data?.message || 'Login failed'
        );
      }
  
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      
      console.log('Registration response:', data);
      localStorage.setItem('token', data.token);
      
      const storedToken = localStorage.getItem('token');
      console.log('Stored token:', storedToken);
  
      setUser(data.user);
  
      return data;
    } catch (error) {
      // Generic error handling
      console.error('Login error:', error);
      
      // Check if error has a response
      if (error instanceof Error && 'response' in error) {
        const apiError = error as { response?: { data?: ErrorResponse } };
        throw new Error(
          apiError.response?.data?.message || 'Login failed'
        );
      }
  
      throw error;
    }
  };
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Clear user in context
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};