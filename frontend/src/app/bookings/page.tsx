"use client";

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['my-bookings'], queryFn: api.getMyBookings, enabled: !!user });
  const { data: ext, isLoading: isLoadingExt } = useQuery({ queryKey: ['my-external-bookings'], queryFn: api.getMyExternalBookings, enabled: !!user });

  if (!user) return <main className="p-6">Please log in to view your bookings.</main>;
  if (isLoading || isLoadingExt) return <main className="p-6">Loading…</main>;

  const bookings = data?.bookings ?? [];
  const external = ext?.bookings ?? [];
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">My Bookings</h1>
      <div className="space-y-3">
        {bookings.map((b: any) => (
          <div key={b._id} className="rounded border p-4">
            <div className="font-medium">{b.property?.title}</div>
            <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
            <div className="mt-1 font-semibold">Total: ${b.totalPrice}</div>
          </div>
        ))}
        {external.map((b: any) => (
          <div key={b._id} className="rounded border p-4">
            <div className="font-medium">{b.name} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{b.provider}</span></div>
            <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
            <div className="mt-1 font-semibold">Total: ${b.totalPrice}</div>
          </div>
        ))}
        {bookings.length === 0 && external.length === 0 && <p>No bookings yet.</p>}
      </div>
    </main>
  );
}



