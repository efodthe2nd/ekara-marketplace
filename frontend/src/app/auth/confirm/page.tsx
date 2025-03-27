// src/app/auth/confirm/page.tsx
'use client';  // Important! Don't forget this

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from 'lucide-react';

const ConfirmationPage = () => {  // Make sure it's defined as a function component
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check your email
          </h2>
          
          <p className="text-gray-600 mb-6">
            We sent a verification link to<br />
            <span className="text-gray-900 font-medium">{email}</span>
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              Please click the link in the email we just sent you to verify your account.
              If you don&apos;t see it, check your spam folder.
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="block w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
            
            <button 
              onClick={() => {
                // Add resend verification email logic here
                console.log('Resend verification email');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Didn&apos;t receive the email? Click to resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;  // Make sure to export the component as default