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
    <form onSubmit={handleSubmit} className="dt-card space-y-4 p-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--dt-fg)]">Check in patient</h3>
        <p className="mt-0.5 text-xs text-[var(--dt-fg-muted)]">Add them to the waiting list for this session.</p>
      </div>

      <div>
        <label htmlFor="checkin-patient" className="dt-label">
          Patient ID (UUID)
        </label>
        <input
          id="checkin-patient"
          type="text"
          placeholder="Patient account UUID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="dt-input font-mono text-xs sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="checkin-priority" className="dt-label">
          Priority
        </label>
        <select
          id="checkin-priority"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value) as QueuePriority)}
          className="dt-input cursor-pointer"
        >
          <option value={QueuePriority.REGULAR}>Regular</option>
          <option value={QueuePriority.VIP}>VIP</option>
          <option value={QueuePriority.EMERGENCY}>Emergency</option>
        </select>
      </div>

      <div>
        <label htmlFor="checkin-notes" className="dt-label">
          Notes <span className="font-normal opacity-70">(optional)</span>
        </label>
        <input
          id="checkin-notes"
          type="text"
          placeholder="e.g. Follow-up, referral"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="dt-input"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !patientId.trim()}
        className="dt-btn-primary w-full py-2.5"
      >
        {loading ? 'Checking in…' : 'Check in'}
      </button>

      {error && (
        <p className="text-sm text-[var(--dt-danger)]" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
