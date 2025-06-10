import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import { ReduxProvider } from './components/providers/ReduxProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ALOKA - Professional Videographer Booking Platform',
  description: 'Find and book professional videographers and studios for your events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}