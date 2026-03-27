'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { QueueList } from '@/components/queue/QueueList';
import { StatsBar } from '@/components/queue/StatsBar';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/Spinner';

export default function PatientQueuePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { state, connected, error } = useQueueSocket(sessionId);
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-8">
      <div className="mb-6">
        <Link href="/queue" className="text-sm font-medium text-[var(--dt-primary)] hover:underline">
          ← Change session
        </Link>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--dt-fg)]">Live queue</h1>
            <p className="mt-0.5 font-mono text-[10px] text-[var(--dt-fg-muted)] sm:text-xs">
              {sessionId}
            </p>
          </div>
          <div
            className="shrink-0 rounded-full border border-[var(--dt-border)] bg-[var(--dt-surface)] px-2.5 py-1 text-xs text-[var(--dt-fg-muted)]"
            title={connected ? 'Connected' : 'Reconnecting'}
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                connected ? 'bg-[var(--dt-success)]' : 'bg-[var(--dt-warning)]'
              }`}
            />
            {connected ? 'Live' : '…'}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-xl border border-red-200/80 bg-[var(--dt-danger-soft)] px-4 py-3 text-sm text-[var(--dt-danger)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {!state ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-[var(--dt-fg-muted)]">Loading queue…</p>
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
