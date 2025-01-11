// src/app/providers.tsx
'use client'

import { AuthProvider } from '@/lib/auth/AuthContext'
import { useEffect, useState } from 'react'


export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Return nothing on server-side and first render
  }

  return <AuthProvider>{children}</AuthProvider>
}