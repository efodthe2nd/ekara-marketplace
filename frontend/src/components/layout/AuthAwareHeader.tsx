// components/layout/AuthAwareHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { DashboardHeader } from './DashboardHeader';

interface AuthAwareHeaderProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onProductCreated?: () => void;
}

export function AuthAwareHeader(props: AuthAwareHeaderProps) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return null;
  }

  return <DashboardHeader {...props} key={user?.id || 'no-user'} />;
}