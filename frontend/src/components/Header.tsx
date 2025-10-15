"use client";

import Link from 'next/link';
import { useAuth } from '../lib/auth';

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold">StayWise</Link>
          <Link href="/properties" className="text-sm text-gray-700 hover:underline">Properties</Link>
          <Link href="/business" className="text-sm text-gray-700 hover:underline">Business</Link>
          {user && <Link href="/bookings" className="text-sm text-gray-700 hover:underline">My Bookings</Link>}
          {user?.role === 'admin' && (
            <Link href="/business/dashboard" className="text-sm text-gray-700 hover:underline">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login" className="text-sm text-blue-700 hover:underline">Login</Link>
              <Link href="/signup" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Sign up</Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">{user.email}</span>
              <button onClick={logout} className="text-sm text-gray-700 hover:underline">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}



