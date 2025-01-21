// src/types/auth.ts
export interface User {
  id: number;
  email: string;
  username: string;
  isBuyer: boolean;
  isSeller: boolean;
  bio?: string;
  profilePicture?: string;
  location?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: 'buyer' | 'seller';
}

export interface ErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}