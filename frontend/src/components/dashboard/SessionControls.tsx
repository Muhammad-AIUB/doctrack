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
    <div className="space-y-3">
      <div className="flex gap-3">
        <button
          onClick={() => handleAction('next')}
          disabled={loading !== null}
          className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {loading === 'next' ? 'Processing...' : 'Next Patient'}
        </button>
        <button
          onClick={() => handleAction('skip')}
          disabled={loading !== null}
          className="rounded-lg border-2 border-amber-500 bg-amber-50 px-6 py-3 font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
        >
          {loading === 'skip' ? '...' : 'Skip'}
        </button>
      </div>
      {error && (
        <p className="rounded bg-red-50 p-2 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
