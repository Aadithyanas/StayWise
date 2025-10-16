"use client";

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-blue-700 hover:text-blue-800">StayWise</Link>
          {!user && (
            <Link href="/business" className="text-sm text-gray-700 hover:underline">Business</Link>
          )}
          {user && (
            <Link href={user.role === 'admin' ? `/properties/owner/${user.id}` : '/properties'} className="text-sm text-gray-700 hover:underline">Properties</Link>
          )}
          {user && <Link href={`/bookings/${user.id}`} className="text-sm text-gray-700 hover:underline">My Bookings</Link>}
          {user?.role === 'admin' && (
            <Link href="/business/dashboard" className="text-sm text-gray-700 hover:underline">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login" className="text-sm text-blue-700 hover:underline">Login</Link>
              <Link href="/signup" className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white shadow hover:bg-blue-700">Sign up</Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button onClick={() => { logout(); router.push('/'); }} className="text-sm text-gray-700 hover:underline">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}



