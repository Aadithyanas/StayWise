"use client";

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useState } from 'react';

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['property', id], queryFn: () => api.getProperty(id), enabled: !!id });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const p = data?.property;
  console.log('🔎 Property:', p);
  console.log('🔎 Property ID:', p?.id);
  console.log('🔎 Property Title:', p?.title);
  console.log('🔎 Property Image URL:', p?.imageUrl);
  console.log('🔎 Property Price Per Night:', p?.pricePerNight);
  console.log('🔎 Property Location:', p?.location);
  console.log('🔎 Property Description:', p?.description);
  console.log('🔎 Property Owner ID:', p?.ownerId);

  const createBooking = useMutation({
    mutationFn: () => {
      if (!p) throw new Error('Property not loaded');
      // Always create external booking and let backend determine ownerId from property
      return api.createExternalBooking({
        provider: 'google',
        externalId: id,
        name: p.title,
        imageUrl: p.imageUrl,
        propertyId: p.id, // Always send propertyId so backend can fetch ownerId
        startDate,
        endDate,
        totalPrice: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) * (p.pricePerNight || 0),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['my-bookings'] });
      await qc.invalidateQueries({ queryKey: ['my-external-bookings'] });
      router.push(`/bookings/${user?.id}`);
    },
    onError: (e: any) => setError(e.message || 'Failed to create booking'),
  });

  if (isLoading || !p) return <main className="p-6">Loading…</main>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{p.title}</h1>
      <div className="mt-1 text-gray-600">{p.location}</div>
      <p className="mt-4 whitespace-pre-line">{p.description}</p>
      <div className="mt-3 font-semibold">${p.pricePerNight}/night</div>

      <div className="mt-6 rounded border p-4">
        <h2 className="font-medium">Book this property</h2>
        {!user && (
          <p className="mt-2 text-sm text-gray-600">Please log in to book.</p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input type="date" className="rounded border p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="rounded border p-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button
            disabled={!user || createBooking.isPending}
            onClick={() => createBooking.mutate()}
            className="rounded bg-blue-600 p-2 text-white disabled:opacity-60"
          >
            {createBooking.isPending ? 'Booking…' : 'Book now'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}









