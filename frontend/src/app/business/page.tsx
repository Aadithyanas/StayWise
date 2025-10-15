"use client";

import Link from 'next/link';

export default function BusinessLandingPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="rounded-lg border bg-white p-8">
        <h1 className="text-3xl font-bold">StayWise for Business</h1>
        <p className="mt-2 text-gray-600">List your property and reach more guests.</p>

        <div className="mt-6 flex gap-3">
          <Link href="/business/login" className="rounded bg-blue-600 px-4 py-2 text-white">Admin Login</Link>
          <Link href="/business/signup" className="rounded border px-4 py-2">Create Admin Account</Link>
        </div>
      </div>
    </main>
  );
}





