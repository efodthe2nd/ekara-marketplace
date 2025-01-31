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
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initial hydration
  useEffect(() => {
    setIsHydrated(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Debugging effect
  // useEffect(() => {
  //   console.log('AuthContext user state:', user);
  // }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          // If either is missing, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }
  
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
    
    if (!isHydrated) {
      return;
    }

    if (isHydrated) {
      checkAuth();
    }

  }, [isHydrated]);

  

  const updateUserProfile = async (updates: Partial<User>) => {
    if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // If you're using localStorage to persist the user data:
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Log to debug
        console.log('Updated user profile:', {
            hasProfilePicture: !!updatedUser.profilePicture
        });
    }
};

  
  
  
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
      console.log('Login response:', data);

      setUser(data.user);
  
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('Updated user state:', data.user);
  
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
  
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear all auth-related items from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear the user state
      setUser(null);
      
      // Force a clean state
      setLoading(true);
      setLoading(false);

      // Optional: Clear any other auth-related storage
      sessionStorage.clear(); // If you're using session storage
      
      // Navigate to home page
      router.push('/');
      
      // Force a page reload to clear any cached states
      router.refresh();
      
      console.log('Logout completed, user state:', null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  // Return null during initial hydration
  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile
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