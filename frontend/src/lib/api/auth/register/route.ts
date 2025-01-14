// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
//import axios from 'axios';
import api from '@/lib/api/axios';
import { RegisterData, AuthResponse, ErrorResponse } from '@/types/auth';

interface ApiError {
  response?: {
    data: ErrorResponse;
    status: number;
  };
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterData;
    
    console.log('Registration request body:', body);

    const response = await api.post<AuthResponse>('/auth/register', body);
    
    console.log('Backend response:', response.data);

    return NextResponse.json({
      success: true,
      data: response.data
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    // Type error as ApiError
    const error = err as ApiError;
    console.error('Registration error:', error);

    // Check if it's a response error
    if (error.response) {
      return NextResponse.json({
        success: false,
        error: error.response.data.message || 'Registration failed',
        details: error.response.data
      }, { 
        status: error.response.status || 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle other errors
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}