'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { QueueStateSnapshot, QueueUpdateEvent } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface UseQueueSocketReturn {
  state: QueueStateSnapshot | null;
  connected: boolean;
  error: string | null;
}

export function useQueueSocket(sessionId: string): UseQueueSocketReturn {
  const [state, setState] = useState<QueueStateSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSequenceRef = useRef(0);
  const socketRef = useRef<Socket | null>(null);

  const handleUpdate = useCallback((event: QueueUpdateEvent) => {
    // Dedup: ignore events older than what we've seen
    if (event.sequence <= lastSequenceRef.current) return;
    lastSequenceRef.current = event.sequence;
    setState(event.data);
  }, []);

  const handleSnapshot = useCallback((snapshot: QueueStateSnapshot) => {
    setState(snapshot);
  }, []);

  useEffect(() => {
    const socket = io(`${WS_URL}/queue`, {
      withCredentials: true,
      query: { sessionId },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      // Request catch-up on reconnect
      socket.emit('request:catchup', {
        sessionId,
        lastSequence: lastSequenceRef.current,
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setConnected(false);
    });

    socket.on('queue:updated', handleUpdate);
    socket.on('queue:snapshot', handleSnapshot);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, handleUpdate, handleSnapshot]);

  return { state, connected, error };
}
