// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  username: string;
  isBuyer: boolean;
  isSeller: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: 'buyer' | 'seller';
  firstName?: string;
  lastName?: string;
  address?: string;
  companyName?: string;
  companyDescription?: string;
  website?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}