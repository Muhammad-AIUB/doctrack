'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { QueuePriority } from '@/types';

interface CheckInFormProps {
  sessionId: string;
  onSuccess?: () => void;
}

export function CheckInForm({ sessionId, onSuccess }: CheckInFormProps) {
  const [patientId, setPatientId] = useState('');
  const [priority, setPriority] = useState<QueuePriority>(QueuePriority.REGULAR);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.queue.checkIn(sessionId, {
        patientId: patientId.trim(),
        priority,
        notes: notes.trim() || undefined,
      });
      setPatientId('');
      setNotes('');
      setPriority(QueuePriority.REGULAR);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4">
      <h3 className="font-semibold text-gray-900">Check In Patient</h3>

      <input
        type="text"
        placeholder="Patient ID (UUID)"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        required
      />

      <select
        value={priority}
        onChange={(e) => setPriority(Number(e.target.value) as QueuePriority)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value={QueuePriority.REGULAR}>Regular</option>
        <option value={QueuePriority.VIP}>VIP</option>
        <option value={QueuePriority.EMERGENCY}>Emergency</option>
      </select>

      <input
        type="text"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />

      <button
        type="submit"
        disabled={loading || !patientId.trim()}
        className="w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Checking in...' : 'Check In'}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
