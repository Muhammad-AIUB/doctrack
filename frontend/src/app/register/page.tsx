'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name, phone, password, role });
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-4 py-10 lg:flex-row lg:items-stretch lg:gap-12 lg:py-16">
      <div className="mb-10 flex flex-1 flex-col justify-center lg:mb-0 lg:pr-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--dt-primary)]">
          Get started
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--dt-fg)] sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-3 max-w-md text-[var(--dt-fg-muted)]">
          Patients can track the queue; doctors and assistants manage sessions from the dashboard.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center lg:justify-end">
        <div className="w-full max-w-md">
          <div className="dt-card p-6 shadow-lg shadow-slate-900/5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reg-name" className="dt-label">
                  Full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dt-input"
                  autoComplete="name"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="dt-label">
                  Phone
                </label>
                <input
                  id="reg-phone"
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
                <label htmlFor="reg-role" className="dt-label">
                  Role
                </label>
                <select
                  id="reg-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="dt-input cursor-pointer"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="ASSISTANT">Assistant</option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-password" className="dt-label">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dt-input"
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
                <p className="mt-1 text-xs text-[var(--dt-fg-muted)]">At least 6 characters</p>
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
                {loading ? 'Creating account…' : 'Register'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--dt-fg-muted)]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[var(--dt-primary)] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
