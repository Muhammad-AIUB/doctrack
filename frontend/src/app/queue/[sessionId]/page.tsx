'use client';

import { use } from 'react';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { QueueList } from '@/components/queue/QueueList';
import { StatsBar } from '@/components/queue/StatsBar';
import { useAuth } from '@/lib/auth-context';

export default function PatientQueuePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { state, connected, error } = useQueueSocket(sessionId);
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Queue</h1>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-500">
            {connected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!state ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-500">Loading queue...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <StatsBar stats={state.stats} />
          <QueueList state={state} highlightPatientId={user?.id} />
        </div>
      )}
    </div>
  );
}
