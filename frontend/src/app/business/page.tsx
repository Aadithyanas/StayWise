"use client";

import Link from 'next/link';

export default function BusinessLandingPage() {
  return (
    <main className="relative mx-auto max-w-4xl p-6">
      <div className="rounded-2xl border bg-white/90 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-extrabold text-gray-900">StayWise for Business</h1>
        <p className="mt-2 text-gray-600">List your property and reach more guests.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/business/login" className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white shadow hover:bg-blue-700">Admin Login</Link>
          <Link href="/business/signup" className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50">Create Admin Account</Link>
        </div>
      </div>
    </main>
  );
}








