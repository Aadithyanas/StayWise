import './globals.css';
import type { Metadata } from 'next';
import { ReactQueryProvider } from '../lib/queryClient';
import { AuthProvider } from '../lib/auth';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'StayWise',
  description: 'Property booking platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ReactQueryProvider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}


