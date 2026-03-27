'use client';

import type { QueueStateSnapshot } from '@/types';
import { formatWaitTime, priorityLabel, priorityColor } from '@/lib/utils';

interface QueueListProps {
  state: QueueStateSnapshot;
  highlightPatientId?: string;
}

export function QueueList({ state, highlightPatientId }: QueueListProps) {
  return (
    <div className="space-y-4">
      {state.currentPatient && (
        <div
          className="relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5"
          style={{
            borderColor: 'var(--dt-success)',
            background: 'var(--dt-success-soft)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--dt-success)]">
                Now serving
              </span>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--dt-fg)] sm:text-4xl">
                #{state.currentPatient.serialNumber}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityColor(state.currentPatient.priority)}`}
            >
              {priorityLabel(state.currentPatient.priority)}
            </span>
          </div>
        </div>
      )}

      {state.queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--dt-border)] bg-[var(--dt-muted)]/40 py-14 text-center">
          <p className="text-sm font-medium text-[var(--dt-fg-muted)]">No patients waiting</p>
          <p className="mt-1 text-xs text-[var(--dt-fg-muted)] opacity-80">
            New check-ins will appear here in order.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {state.queue.map((entry) => {
            const isHighlighted = entry.patientId === highlightPatientId;
            return (
              <li key={entry.entryId}>
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all sm:p-4 ${
                    isHighlighted
                      ? 'border-[var(--dt-primary)] bg-[var(--dt-accent-soft)] ring-2 ring-[var(--dt-primary)]/25'
                      : 'border-[var(--dt-border)] bg-[var(--dt-surface)] hover:border-[var(--dt-primary)]/20'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dt-muted)] text-sm font-bold tabular-nums text-[var(--dt-fg)]">
                      {entry.position}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tabular-nums text-[var(--dt-fg)]">
                        #{entry.serialNumber}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${priorityColor(entry.priority)}`}
                      >
                        {priorityLabel(entry.priority)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold tabular-nums text-[var(--dt-fg)] sm:text-xl">
                      {formatWaitTime(entry.estimatedWaitSec)}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--dt-fg-muted)] sm:text-xs">
                      Est. wait
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
