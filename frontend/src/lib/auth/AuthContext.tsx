'use client'; 

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { User, RegisterData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (typeof window !== 'undefined') {  // Check if we're on client side
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get<{ user: User }>('/auth/profile');  // Add type for response
          setUser(response.data.user);
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  interface AuthResponse {
    token: string;
    user: User;
  }
  
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
    } catch {
      throw new Error('Login failed');
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
    } catch {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
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