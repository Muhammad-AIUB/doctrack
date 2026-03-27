'use client';

import { use } from 'react';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { QueueList } from '@/components/queue/QueueList';
import { StatsBar } from '@/components/queue/StatsBar';
import { SessionControls } from '@/components/dashboard/SessionControls';
import { CheckInForm } from '@/components/dashboard/CheckInForm';

export default function SessionDashboardPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { state, connected } = useQueueSocket(sessionId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Dashboard</h1>
          <p className="text-sm text-gray-500">Session: {sessionId.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {!state ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Controls + Check-in */}
          <div className="space-y-6 lg:col-span-1">
            <SessionControls sessionId={sessionId} />
            <CheckInForm sessionId={sessionId} />

            {/* Session Info */}
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Quick Share</h3>
              <p className="text-xs text-gray-500">
                Patients can view the queue at:
              </p>
              <code className="mt-1 block rounded bg-gray-100 p-2 text-xs text-gray-700 break-all">
                /queue/{sessionId}
              </code>
            </div>
          </div>

          {/* Right Column: Stats + Queue */}
          <div className="space-y-6 lg:col-span-2">
            <StatsBar stats={state.stats} />
            <div className="rounded-lg border bg-white p-4">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Queue ({state.stats.totalWaiting} waiting)
              </h2>
              <QueueList state={state} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
