'use client';

import type { QueueStateSnapshot } from '@/types';
import { formatWaitTime } from '@/lib/utils';

interface StatsBarProps {
  stats: QueueStateSnapshot['stats'];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg bg-white p-4 text-center shadow-sm border">
        <p className="text-2xl font-bold text-indigo-600">{stats.totalWaiting}</p>
        <p className="text-xs text-gray-500">Waiting</p>
      </div>
      <div className="rounded-lg bg-white p-4 text-center shadow-sm border">
        <p className="text-2xl font-bold text-indigo-600">
          {formatWaitTime(stats.avgDurationSec)}
        </p>
        <p className="text-xs text-gray-500">Avg Duration</p>
      </div>
      <div className="rounded-lg bg-white p-4 text-center shadow-sm border">
        <p className="text-2xl font-bold text-indigo-600">{stats.totalServed}</p>
        <p className="text-xs text-gray-500">Served</p>
      </div>
    </div>
  );
}
