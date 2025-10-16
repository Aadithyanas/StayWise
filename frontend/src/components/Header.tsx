"use client";

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-all relative">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-blue-700 hover:text-blue-800">StayWise</Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-700 hover:underline">Home</Link>
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
          </div>
        </nav>
        <div className="hidden md:flex items-center gap-3">
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
        {/* Mobile hamburger */}
        <button aria-label="Open menu" className="md:hidden inline-flex items-center justify-center rounded p-2 text-gray-700 hover:bg-gray-100" onClick={() => setOpen((v) => !v)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile overlay and menu panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setOpen(false)} />
          <div className="md:hidden absolute left-0 right-0 top-full z-50 mx-3 mt-2 rounded-xl border bg-white shadow-2xl px-6 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="text-sm text-gray-700">Home</Link>
            {!user && (
              <Link href="/business" className="text-sm text-gray-700">Business</Link>
            )}
            {user && (
              <Link href={user.role === 'admin' ? `/properties/owner/${user.id}` : '/properties'} className="text-sm text-gray-700">Properties</Link>
            )}
            {user && <Link href={`/bookings/${user.id}`} className="text-sm text-gray-700">My Bookings</Link>}
            {user?.role === 'admin' && (
              <Link href="/business/dashboard" className="text-sm text-gray-700">Admin</Link>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/login" className="text-sm text-blue-700">Login</Link>
                <Link href="/signup" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Sign up</Link>
              </>
            ) : (
              <button onClick={() => { setOpen(false); logout(); router.push('/'); }} className="text-sm text-gray-700">Logout</button>
            )}
          </div>
          </div>
        </>
      )}
    </header>
  );
}



