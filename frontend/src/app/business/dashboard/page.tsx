"use client";

import { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', location: '', pricePerNight: '', images: '' });
  const [message, setMessage] = useState<string | null>(null);

  if (!user || user.role !== 'admin') {
    router.push('/business/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const price = parseFloat(form.pricePerNight);
    try {
      const res = await api.createProperty({
        title: form.title,
        description: form.description,
        location: form.location,
        pricePerNight: isNaN(price) ? 0 : price,
        images: form.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setMessage(`Created property: ${res.property.title}`);
      setForm({ title: '', description: '', location: '', pricePerNight: '', images: '' });
    } catch (e: any) {
      setMessage(e.message || 'Failed to create property');
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Business Dashboard</h1>
      <div className="rounded border bg-white p-6">
        <h2 className="mb-3 text-lg font-medium">Add a Property</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full rounded border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="w-full rounded border p-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <textarea className="w-full rounded border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="w-full rounded border p-2" placeholder="Price per night" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} />
          <input className="w-full rounded border p-2" placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <button className="w-full rounded bg-blue-600 p-2 text-white">Create Property</button>
        </form>
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>
    </main>
  );
}








