"use client";

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth';

export default function OwnerPropertiesPage() {
  const params = useParams<{ ownerId: string }>();
  const routeOwnerId = params?.ownerId as string;
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return <main className="p-6">Please log in to view properties.</main>;
  if (user.role !== 'admin') {
    router.replace('/');
    return <main className="p-6">Redirecting…</main>;
  }
  if (user.id !== routeOwnerId) {
    router.replace(`/properties/owner/${user.id}`);
    return <main className="p-6">Redirecting…</main>;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['local-properties', user.id],
    queryFn: api.getLocalProperties,
  });

  if (isLoading) return <main className="p-6">Loading properties…</main>;

  const all = data?.properties ?? [];
  const mine = all.filter((p: any) => p.ownerId === user.id);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">My Properties</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mine.map((p: any) => (
          <div key={p._id} className="rounded border p-4">
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-600">{p.location}</div>
            <div className="mt-1 font-semibold">${p.pricePerNight}/night</div>
          </div>
        ))}
      </div>
      {mine.length === 0 && <p>No properties found.</p>}
    </main>
  );
}


