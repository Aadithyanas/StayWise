"use client";

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { usdToInr, formatINR } from '../../../lib/currency';
import { useAuth } from '../../../lib/auth';
import { useState } from 'react';

export default function UserBookingsPage() {
  const params = useParams<{ userId: string }>();
  const routeUserId = params?.userId as string;
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', user?.role, user?.id],
    queryFn: () => (user?.role === 'admin' ? api.getAdminExternalBookings() : api.getMyBookings()),
    enabled: !!user,
  });
  const { data: ext, isLoading: isLoadingExt } = useQuery({
    queryKey: ['my-external-bookings', user?.id],
    queryFn: api.getMyExternalBookings,
    enabled: !!user && user?.role !== 'admin',
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['bookings', user?.role, user?.id] });
    },
  });

  const cancelExternal = useMutation({
    mutationFn: (id: string) => api.cancelExternalBooking(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['my-external-bookings', user?.id] });
    },
  });

  const debugAdmin = useMutation({
    mutationFn: () => api.debugAdminBookings(),
    onSuccess: (data) => {
      console.log('Debug data:', data);
      alert(`Admin ID: ${data.adminId}\nTotal bookings: ${data.totalBookings}\nAdmin bookings: ${data.adminBookings}\nAdmin properties: ${data.adminProperties}`);
    },
  });

  const debugAll = useMutation({
    mutationFn: () => api.debugAllBookings(),
    onSuccess: (data) => {
      console.log('All bookings data:', data);
      alert(`Total bookings: ${data.totalBookings}\nTotal properties: ${data.totalProperties}\nCheck console for full data`);
    },
  });

  const migrateBookings = useMutation({
    mutationFn: () => api.migrateBookings(),
    onSuccess: async (data) => {
      alert(`Migration complete: ${data.message}`);
      await qc.invalidateQueries({ queryKey: ['bookings', user?.role, user?.id] });
    },
  });

  if (!user) return <main className="p-6">Please log in to view bookings.</main>;
  if (user.id !== routeUserId) {
    // Prevent viewing others' pages
    router.replace(`/bookings/${user.id}`);
    return <main className="p-6">Redirecting…</main>;
  }

  if (isLoading || isLoadingExt) return <main className="p-6">Loading…</main>;

  const allBookings = user.role === 'admin' ? [] : (data?.bookings ?? []); // Regular bookings only for non-admin users
  const allExternal = user.role === 'admin' ? (data?.bookings ?? []) : (ext?.bookings ?? []); // For admin, use admin external bookings from data
  
  // Filter bookings by status
  const activeBookings = allBookings.filter((b: any) => b.status !== 'cancelled');
  const cancelledBookings = allBookings.filter((b: any) => b.status === 'cancelled');
  const activeExternal = allExternal.filter((b: any) => b.status !== 'cancelled');
  const cancelledExternal = allExternal.filter((b: any) => b.status === 'cancelled');
  
  const currentBookings = activeTab === 'active' ? activeBookings : cancelledBookings;
  const currentExternal = activeTab === 'active' ? activeExternal : cancelledExternal;

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* <h1 className="mb-4 text-2xl font-semibold">{user.role === 'admin' ? 'Property Bookings' : 'My Bookings'}</h1>
      image.png
      Debug buttons for admin
      {user.role === 'admin' && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => debugAll.mutate()}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white"
          >
            Check All Data
          </button>
          <button
            onClick={() => debugAdmin.mutate()}
            className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
          >
            Debug Admin
          </button>
          <button
            onClick={() => migrateBookings.mutate()}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
          >
            Fix Old Bookings
          </button>
        </div>
      )} */}
      
      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Bookings ({activeBookings.length + activeExternal.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'cancelled'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Cancelled Bookings ({cancelledBookings.length + cancelledExternal.length})
        </button>
      </div>

      <div className="space-y-3">
              {currentBookings.map((b: any) => (
          <div key={b._id} className="rounded border p-4">
            <div className="flex items-start gap-3">
              {b.imageUrl && (
                <img src={b.imageUrl} alt={b.hotelName || b.name || 'booking'} className="h-16 w-24 rounded object-cover" />
              )}
              <div className="font-medium">{b.hotelName || b.name || b.property?.title}</div>
            </div>
            <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
            <div className="mt-1 font-semibold">Total: {formatINR(usdToInr(b.totalPrice || 0))}</div>
            {b.status === 'cancelled' ? (
              <div className="mt-1 text-sm text-red-600">Cancelled</div>
            ) : (
              user.role !== 'admin' && (
                <button onClick={() => cancel.mutate(b._id)} className="mt-2 rounded border px-3 py-1 text-sm">
                  {cancel.isPending ? 'Cancelling…' : 'Cancel'}
                </button>
              )
            )}
            {b.status && (
              <div className="text-sm text-gray-600">Status: {b.status}</div>
            )}
            {user.role === 'admin' && (b.userName || b.user?.email) && (
              <div className="text-sm text-gray-600">Booked by: {b.userName || b.user.email}</div>
            )}
            {user.role === 'admin' && b.provider && (
              <div className="text-sm text-gray-600">Provider: {b.provider}</div>
            )}
          </div>
        ))}
        {currentExternal.map((b: any) => (
          <div key={b._id} className="rounded border p-4">
            <div className="flex items-start gap-3">
              {b.imageUrl && (
                <img src={b.imageUrl} alt={b.hotelName || b.name} className="h-16 w-24 rounded object-cover" />
              )}
              <div className="font-medium">{b.hotelName || b.name} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{b.provider}</span></div>
            </div>
            <div className="text-sm text-gray-600">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
            <div className="mt-1 font-semibold">Total: {formatINR(usdToInr(b.totalPrice || 0))}</div>
            {b.status === 'cancelled' ? (
              <div className="mt-1 text-sm text-red-600">Cancelled</div>
            ) : (
              user.role !== 'admin' && (
                <button onClick={() => cancelExternal.mutate(b._id)} className="mt-2 rounded border px-3 py-1 text-sm">
                  {cancelExternal.isPending ? 'Cancelling…' : 'Cancel'}
                </button>
              )
            )}
            {b.status && (
              <div className="text-sm text-gray-600">Status: {b.status}</div>
            )}
            {b.adminId && (
              <div className="text-sm text-gray-600">Property Owner ID: {b.adminId}</div>
            )}
            {!b.adminId && (
              <div className="text-sm text-gray-500">Property Owner: N/A</div>
            )}
            {user.role === 'admin' && (b.userName || b.user?.email) && (
              <div className="text-sm text-gray-600">Booked by: {b.userName || b.user.email}</div>
            )}
          </div>
        ))}
        {currentBookings.length === 0 && currentExternal.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            {activeTab === 'active' ? 'No active bookings.' : 'No cancelled bookings.'}
          </p>
        )}
      </div>
    </main>
  );
}


