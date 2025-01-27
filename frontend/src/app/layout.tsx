// src/app/layout.tsx
import { Header } from '@/components/layout/Header';
import { AuthProvider } from '@/lib/auth/AuthContext';
import './globals.css';
import ClientSideWrapper from '@/lib/client/ClientSideWrapper';
//import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ClientSideWrapper>
            <Header />
            {children}
          </ClientSideWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}