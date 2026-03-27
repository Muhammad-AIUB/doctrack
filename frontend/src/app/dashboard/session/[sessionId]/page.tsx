'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQueueSocket } from '@/hooks/useQueueSocket';
import { QueueList } from '@/components/queue/QueueList';
import { StatsBar } from '@/components/queue/StatsBar';
import { SessionControls } from '@/components/dashboard/SessionControls';
import { CheckInForm } from '@/components/dashboard/CheckInForm';
import { Spinner } from '@/components/ui/Spinner';

export default function SessionDashboardPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { state, connected } = useQueueSocket(sessionId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--dt-primary)] hover:underline"
          >
            ← All chambers
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--dt-fg)] sm:text-3xl">
            Session dashboard
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--dt-fg-muted)] sm:text-sm">
            {sessionId}
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--dt-border)] bg-[var(--dt-surface)] px-3 py-1.5 text-sm"
          title={connected ? 'Socket connected' : 'Disconnected'}
        >
          <span
            className={`relative flex h-2.5 w-2.5 rounded-full ${
              connected ? 'bg-[var(--dt-success)]' : 'bg-[var(--dt-danger)]'
            }`}
          >
            {connected && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--dt-success)] opacity-40" />
            )}
          </span>
          <span className="text-[var(--dt-fg-muted)]">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>

      {!state ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-sm text-[var(--dt-fg-muted)]">Loading session…</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <SessionControls sessionId={sessionId} />
            <CheckInForm sessionId={sessionId} />

            <div className="dt-card p-5">
              <h3 className="text-sm font-semibold text-[var(--dt-fg)]">Share with patients</h3>
              <p className="mt-1 text-xs text-[var(--dt-fg-muted)]">
                They can open this path (or scan a QR you build from it):
              </p>
              <code className="mt-3 block rounded-lg bg-[var(--dt-muted)] px-3 py-2.5 font-mono text-xs break-all text-[var(--dt-fg)]">
                /queue/{sessionId}
              </code>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <StatsBar stats={state.stats} />
            <div className="dt-card overflow-hidden p-5 sm:p-6">
              <h2 className="mb-1 text-lg font-semibold text-[var(--dt-fg)]">Queue</h2>
              <p className="mb-5 text-sm text-[var(--dt-fg-muted)]">
                {state.stats.totalWaiting} waiting · {state.stats.totalServed} served today
              </p>
              <QueueList state={state} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
