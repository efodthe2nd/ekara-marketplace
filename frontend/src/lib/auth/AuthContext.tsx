// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterData, AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
  
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    checkAuth();
  }, []);
  
  
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      //console.log('Login response:', data);
  
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
  
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  

  const register = async (userData: RegisterData) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData);
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
  
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if error has a response
      // if (error instanceof Error && 'response' in error) {
      //   const apiError = error as { response?: { data?: ErrorResponse } };
      //   throw new Error(
      //     apiError.response?.data?.message || 'Login failed'
      //   );
      // }
  
      throw error;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Clear user in context
    setUser(null);
    router.push('/');
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