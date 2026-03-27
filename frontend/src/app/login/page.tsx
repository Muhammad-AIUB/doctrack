'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(phone, password);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-4 py-10 lg:flex-row lg:items-stretch lg:gap-12 lg:py-16">
      <div className="mb-10 flex flex-1 flex-col justify-center lg:mb-0 lg:pr-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--dt-primary)]">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--dt-fg)] sm:text-4xl">
          Sign in to DocTrack
        </h1>
        <p className="mt-3 max-w-md text-[var(--dt-fg-muted)]">
          Access your dashboard to run sessions, or join the queue view with your phone account.
        </p>
        <ul className="mt-8 hidden space-y-3 text-sm text-[var(--dt-fg-muted)] sm:block">
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dt-success-soft)] text-xs text-[var(--dt-success)]">
              ✓
            </span>
            Live updates for everyone in the queue
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dt-success-soft)] text-xs text-[var(--dt-success)]">
              ✓
            </span>
            Clear ETAs based on average visit time
          </li>
        </ul>
      </div>

      <div className="flex flex-1 items-center justify-center lg:justify-end">
        <div className="w-full max-w-md">
          <div className="dt-card p-6 shadow-lg shadow-slate-900/5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-phone" className="dt-label">
                  Phone
                </label>
                <input
                  id="login-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="dt-input"
                  placeholder="+880…"
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="dt-label">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dt-input"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div
                  className="rounded-xl border border-red-200 bg-[var(--dt-danger-soft)] px-3 py-2.5 text-center text-sm text-[var(--dt-danger)]"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="dt-btn-primary w-full py-3 text-base">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--dt-fg-muted)]">
              No account?{' '}
              <Link href="/register" className="font-semibold text-[var(--dt-primary)] hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
