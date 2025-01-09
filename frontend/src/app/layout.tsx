// src/app/layout.tsx
//import { AuthProvider } from '@/lib/auth/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Spareparts Marketplace',
  description: 'Buy and sell spare parts online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}