'use client';

import type { QueueStateSnapshot } from '@/types';
import { formatWaitTime } from '@/lib/utils';

interface StatsBarProps {
  stats: QueueStateSnapshot['stats'];
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Waiting', value: String(stats.totalWaiting), accent: 'var(--dt-primary)' },
    {
      label: 'Avg duration',
      value: formatWaitTime(stats.avgDurationSec),
      accent: 'var(--dt-accent)',
    },
    { label: 'Served', value: String(stats.totalServed), accent: 'var(--dt-success)' },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="dt-card relative overflow-hidden px-2 py-4 text-center sm:px-4 sm:py-5"
        >
          <div
            className="absolute inset-x-0 top-0 h-0.5 opacity-90"
            style={{ background: item.accent }}
          />
          <p
            className="text-xl font-bold tabular-nums tracking-tight sm:text-2xl"
            style={{ color: item.accent }}
          >
            {item.value}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[var(--dt-fg-muted)] sm:text-xs">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
