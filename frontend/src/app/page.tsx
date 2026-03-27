'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--dt-primary)]">
          Chamber queue, simplified
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--dt-fg)] sm:text-5xl">
          Wait less. Know your turn.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--dt-fg-muted)]">
          Real-time medical queue tracking and dynamic ETA so patients and staff stay in sync.
        </p>
      </div>

      {user ? (
        <div className="mt-12 space-y-8">
          <div className="dt-card p-6 text-center sm:p-8">
            <p className="text-[var(--dt-fg-muted)]">
              Welcome back,
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--dt-fg)]">{user.name}</p>
            <span className="mt-3 inline-flex rounded-full bg-[var(--dt-muted)] px-3 py-1 text-xs font-medium text-[var(--dt-fg-muted)]">
              {user.role}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(user.role === 'DOCTOR' || user.role === 'ASSISTANT') && (
              <Link
                href="/dashboard"
                className="group dt-card p-6 text-left transition-all hover:border-[var(--dt-primary)]/40 hover:shadow-md hover:shadow-[var(--dt-primary)]/5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dt-accent-soft)] text-lg">
                  ⚕
                </span>
                <h2 className="mt-4 text-lg font-semibold text-[var(--dt-fg)] group-hover:text-[var(--dt-primary)]">
                  Dashboard
                </h2>
                <p className="mt-1 text-sm text-[var(--dt-fg-muted)]">
                  Sessions, check-in, and queue control
                </p>
              </Link>
            )}
            <Link
              href="/queue"
              className="group dt-card p-6 text-left transition-all hover:border-[var(--dt-primary)]/40 hover:shadow-md hover:shadow-[var(--dt-primary)]/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dt-success-soft)] text-lg">
                ◷
              </span>
              <h2 className="mt-4 text-lg font-semibold text-[var(--dt-fg)] group-hover:text-[var(--dt-primary)]">
                Live queue
              </h2>
              <p className="mt-1 text-sm text-[var(--dt-fg-muted)]">
                Your position and estimated wait time
              </p>
            </Link>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-[var(--dt-fg-muted)] underline-offset-4 transition-colors hover:text-[var(--dt-fg)] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="dt-btn-primary min-w-[10rem] px-8 py-3 text-base">
            Sign in
          </Link>
          <Link href="/register" className="dt-btn-secondary min-w-[10rem] px-8 py-3 text-base">
            Create account
          </Link>
        </div>
      )}
    </div>
  );
}
