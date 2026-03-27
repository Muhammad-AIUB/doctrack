'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import type { Chamber } from '@/types';

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
      // If session already exists for today, try to find the active one
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Create Chamber */}
      <form onSubmit={createChamber} className="mb-8 flex gap-2">
        <input
          type="text"
          value={newChamberName}
          onChange={(e) => setNewChamberName(e.target.value)}
          placeholder="New chamber name..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? '...' : 'Add Chamber'}
        </button>
      </form>

      {/* Chambers List */}
      {chambers.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No chambers yet. Create one to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {chambers.map((chamber) => (
            <div
              key={chamber.id}
              className="flex items-center justify-between rounded-lg border bg-white p-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{chamber.name}</h3>
                <p className="text-sm text-gray-500">
                  Avg: {chamber.defaultAvgDurationMin} min
                  {chamber.maxPatientsPerSession &&
                    ` | Max: ${chamber.maxPatientsPerSession}`}
                </p>
              </div>
              <button
                onClick={() => startSession(chamber.id)}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Start Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
