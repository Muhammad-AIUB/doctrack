'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function QueueEntryPage() {
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) {
      router.push(`/queue/${sessionId.trim()}`);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--dt-primary)]">
          Patient view
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--dt-fg)]">Join a queue</h1>
        <p className="mt-2 text-[var(--dt-fg-muted)]">
          Enter the session ID from your doctor or reception.
        </p>
      </div>

      <div className="mt-10 dt-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="session-id" className="dt-label">
              Session ID
            </label>
            <input
              id="session-id"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Paste or type the full ID"
              className="dt-input text-center font-mono text-sm sm:text-base"
              required
            />
          </div>
          <button type="submit" className="dt-btn-success w-full py-3 text-base">
            View live queue
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-[var(--dt-fg-muted)]">
        <Link href="/" className="font-medium text-[var(--dt-primary)] hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
