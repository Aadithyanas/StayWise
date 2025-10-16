"use client";

import { useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { useRouter } from 'next/navigation';

export default function BusinessSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.adminSignup(email, password);
      login(res.token, res.user);
      router.push('/business/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create Admin Account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full rounded border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-blue-600 p-2 text-white">Sign up</button>
      </form>
    </main>
  );
}








