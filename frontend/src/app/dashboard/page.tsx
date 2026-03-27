'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import type { Chamber } from '@/types';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [newChamberName, setNewChamberName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.chambers.list().then((data) => setChambers(data as Chamber[])).catch(() => {});
    }
  }, [user]);

  const createChamber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChamberName.trim()) return;
    setCreating(true);
    try {
      const chamber = await api.chambers.create({ name: newChamberName.trim() }) as Chamber;
      setChambers((prev) => [chamber, ...prev]);
      setNewChamberName('');
    } catch {
      // handle error
    } finally {
      setCreating(false);
    }
  };

  const startSession = async (chamberId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const session = await api.sessions.create(chamberId, { sessionDate: today! }) as { id: string };
      await api.sessions.updateStatus(session.id, 'ACTIVE');
      router.push(`/dashboard/session/${session.id}`);
    } catch (err: unknown) {
      try {
        const active = await api.sessions.getActive(chamberId) as { id: string } | null;
        if (active) {
          router.push(`/dashboard/session/${active.id}`);
        }
      } catch {
        alert(err instanceof Error ? err.message : 'Failed to start session');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--dt-primary)]">Staff</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--dt-fg)]">Dashboard</h1>
        <p className="mt-2 text-[var(--dt-fg-muted)]">
          Chambers and today&apos;s sessions.{' '}
          <Link href="/" className="font-medium text-[var(--dt-primary)] hover:underline">
            Home
          </Link>
        </p>
      </div>

      <div className="dt-card mb-8 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-[var(--dt-fg)]">New chamber</h2>
        <p className="mt-0.5 text-xs text-[var(--dt-fg-muted)]">Add a room or doctor chamber to start sessions.</p>
        <form onSubmit={createChamber} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newChamberName}
            onChange={(e) => setNewChamberName(e.target.value)}
            placeholder="e.g. Chamber 2 — Dr. Rahman"
            className="dt-input flex-1"
          />
          <button
            type="submit"
            disabled={creating}
            className="dt-btn-primary shrink-0 px-6 py-2.5 sm:w-auto"
          >
            {creating ? 'Adding…' : 'Add chamber'}
          </button>
        </form>
      </div>

      {chambers.length === 0 ? (
        <div className="dt-card py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dt-muted)] text-2xl text-[var(--dt-fg-muted)]">
            +
          </div>
          <p className="mt-4 font-medium text-[var(--dt-fg)]">No chambers yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--dt-fg-muted)]">
            Create a chamber above, then start a session to open the queue for patients.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {chambers.map((chamber) => (
            <li key={chamber.id}>
              <div className="dt-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <h3 className="font-semibold text-[var(--dt-fg)]">{chamber.name}</h3>
                  <p className="mt-1 text-sm text-[var(--dt-fg-muted)]">
                    Avg visit: {chamber.defaultAvgDurationMin} min
                    {chamber.maxPatientsPerSession != null &&
                      ` · Max ${chamber.maxPatientsPerSession} per session`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startSession(chamber.id)}
                  className="dt-btn-success w-full shrink-0 py-2.5 sm:w-auto sm:min-w-[9rem]"
                >
                  Start session
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
