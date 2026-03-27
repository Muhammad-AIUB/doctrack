'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';

interface SessionControlsProps {
  sessionId: string;
  onAction?: () => void;
}

export function SessionControls({ sessionId, onAction }: SessionControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'next' | 'skip') => {
    setLoading(action);
    setError(null);
    try {
      if (action === 'next') {
        await api.queue.next(sessionId);
      } else {
        await api.queue.skip(sessionId);
      }
      onAction?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="dt-card p-5">
      <h3 className="text-sm font-semibold text-[var(--dt-fg)]">Desk actions</h3>
      <p className="mt-0.5 text-xs text-[var(--dt-fg-muted)]">Advance the queue for this session.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => handleAction('next')}
          disabled={loading !== null}
          className="dt-btn-success flex-1 py-3.5 text-base font-bold shadow-md shadow-teal-600/25 dark:shadow-teal-400/20"
        >
          {loading === 'next' ? 'Processing…' : 'Next patient'}
        </button>
        <button
          type="button"
          onClick={() => handleAction('skip')}
          disabled={loading !== null}
          className="rounded-xl border-2 border-[var(--dt-warning)]/50 bg-[var(--dt-warning-soft)] px-5 py-3.5 text-sm font-bold text-[var(--dt-warning)] transition-colors hover:border-[var(--dt-warning)] disabled:opacity-50"
        >
          {loading === 'skip' ? '…' : 'Skip'}
        </button>
      </div>
      {error && (
        <p
          className="mt-3 rounded-lg bg-[var(--dt-danger-soft)] px-3 py-2 text-center text-sm text-[var(--dt-danger)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
