'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Join Queue</h1>
        <p className="mb-8 text-gray-600">
          Enter the session ID to view the live queue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Session ID"
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="w-full rounded-md bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700"
          >
            View Queue
          </button>
        </form>
      </div>
    </div>
  );
}
