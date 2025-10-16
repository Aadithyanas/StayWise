"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user) return;
    router.replace(`/bookings/${user.id}`);
  }, [user, router]);

  return <main className="p-6">Loading…</main>;
}



