// src/app/auth/layout.tsx
import React from 'react';  // Add this import

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8">
        {children}
      </div>
    </div>
  );
}