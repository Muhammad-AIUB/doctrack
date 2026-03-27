'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          doctrack
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Smart Medical Queue & Dynamic ETA Engine
        </p>
      </div>

      {user ? (
        <div className="mt-10 space-y-6">
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold">{user.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              Role: {user.role}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(user.role === 'DOCTOR' || user.role === 'ASSISTANT') && (
              <Link
                href="/dashboard"
                className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6 text-center transition-colors hover:border-indigo-400"
              >
                <h2 className="text-lg font-semibold text-indigo-900">Dashboard</h2>
                <p className="mt-1 text-sm text-indigo-600">
                  Manage sessions & queue
                </p>
              </Link>
            )}
            <Link
              href="/queue"
              className="rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center transition-colors hover:border-green-400"
            >
              <h2 className="text-lg font-semibold text-green-900">Queue View</h2>
              <p className="mt-1 text-sm text-green-600">
                Check your position & ETA
              </p>
            </Link>
          </div>

          <button
            onClick={logout}
            className="mx-auto block text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border-2 border-indigo-600 px-8 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
