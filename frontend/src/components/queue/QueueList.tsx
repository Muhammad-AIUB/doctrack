'use client';

import type { QueueStateSnapshot } from '@/types';
import { formatWaitTime, priorityLabel, priorityColor } from '@/lib/utils';

interface QueueListProps {
  state: QueueStateSnapshot;
  highlightPatientId?: string;
}

export function QueueList({ state, highlightPatientId }: QueueListProps) {
  return (
    <div className="space-y-3">
      {/* Current Patient */}
      {state.currentPatient && (
        <div className="rounded-lg border-2 border-green-400 bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-green-600">
                Now Serving
              </span>
              <p className="text-2xl font-bold text-green-800">
                #{state.currentPatient.serialNumber}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityColor(state.currentPatient.priority)}`}>
              {priorityLabel(state.currentPatient.priority)}
            </span>
          </div>
        </div>
      )}

      {/* Queue */}
      {state.queue.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No patients waiting</p>
      ) : (
        <div className="space-y-2">
          {state.queue.map((entry) => {
            const isHighlighted = entry.patientId === highlightPatientId;
            return (
              <div
                key={entry.entryId}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  isHighlighted
                    ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                    {entry.position}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      #{entry.serialNumber}
                    </p>
                    <span className={`rounded border px-2 py-0.5 text-xs font-medium ${priorityColor(entry.priority)}`}>
                      {priorityLabel(entry.priority)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatWaitTime(entry.estimatedWaitSec)}
                  </p>
                  <p className="text-xs text-gray-500">est. wait</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
