"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { gsap } from 'gsap';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blob1 = useRef<HTMLDivElement | null>(null);
  const blob2 = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.auth-card', { y: 30, autoAlpha: 0, duration: 0.8, ease: 'power3.out' });
      gsap.from('.auth-title', { y: 10, autoAlpha: 0, duration: 0.6, delay: 0.1 });
      gsap.from('.auth-field', { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.08, delay: 0.15 });
      gsap.from('.auth-action', { y: 12, autoAlpha: 0, duration: 0.6, delay: 0.25 });

      if (blob1.current && blob2.current) {
        gsap.to(blob1.current, { x: 40, y: -20, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to(blob2.current, { x: -30, y: 20, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }
    }, cardRef);
    return () => ctx.revert();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.token, res.user);
      router.push('/properties');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-4 py-12">
      {/* Floating gradient blobs */}
      <div ref={blob1} className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div ref={blob2} className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div ref={cardRef} className="auth-card relative z-10 mx-auto w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur">
        <h1 className="auth-title mb-2 text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-600">Welcome back! Please enter your details.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="auth-field flex items-center rounded-lg border border-gray-300 bg-white pr-3 focus-within:border-blue-600">
            <span className="pl-3 text-gray-400">@</span>
            <input
              className="w-full rounded-lg border-0 bg-transparent p-3 focus:outline-none"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field flex items-center rounded-lg border border-gray-300 bg-white pr-3 focus-within:border-blue-600">
            <span className="pl-3 text-gray-400">•••</span>
            <input
              className="w-full rounded-lg border-0 bg-transparent p-3 focus:outline-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="auth-field flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" /> Remember me
            </label>
            <a href="#" className="auth-field text-sm text-blue-700 hover:underline">Forgot password?</a>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="auth-action w-full rounded-lg bg-blue-600 p-3 font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="auth-field text-center text-sm text-gray-600">Don't have an account? <a href="/signup" className="text-blue-700 hover:underline">Sign up</a></p>
        </form>
      </div>
    </main>
  );
}









