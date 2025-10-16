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
            <footer className="mt-16 border-t bg-white">
              <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-lg font-semibold">About StayWise</h3>
                  <p className="mt-2 text-sm text-gray-600">Discover handpicked stays with beautiful views, warm hospitality and memorable experiences.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Why you'll love it</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                    <li>Curated hotels with great ambience</li>
                    <li>Transparent pricing and easy booking</li>
                    <li>Responsive support when you need it</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Contact</h3>
                  <p className="mt-2 text-sm text-gray-600">support@staywise.app</p>
                </div>
              </div>
              <div className="bg-gray-100 py-4 text-center text-sm text-gray-600">© {new Date().getFullYear()} StayWise. All rights reserved.</div>
            </footer>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}


