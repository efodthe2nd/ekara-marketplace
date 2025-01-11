'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Providers } from '@/app/providers';

const LoginPage: React.FC = () => {
  return (
    <Providers>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Login</h1>
          <LoginForm />
        </div>
      </div>
    </Providers>
  );
};

export default LoginPage;