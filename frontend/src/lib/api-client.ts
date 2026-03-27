const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// --- Auth ---

export const api = {
  auth: {
    register(data: { name: string; phone: string; password: string; role: string; email?: string }) {
      return request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) });
    },
    login(data: { phone: string; password: string }) {
      return request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) });
    },
    refresh() {
      return request('/api/v1/auth/refresh', { method: 'POST' });
    },
    logout() {
      return request('/api/v1/auth/logout', { method: 'POST' });
    },
  },

  users: {
    me() {
      return request('/api/v1/users/me');
    },
  },

  chambers: {
    list() {
      return request('/api/v1/chambers');
    },
    create(data: { name: string; address?: string; defaultAvgDurationMin?: number }) {
      return request('/api/v1/chambers', { method: 'POST', body: JSON.stringify(data) });
    },
    get(id: string) {
      return request(`/api/v1/chambers/${id}`);
    },
  },

  sessions: {
    create(chamberId: string, data: { sessionDate: string }) {
      return request(`/api/v1/chambers/${chamberId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    get(id: string) {
      return request(`/api/v1/sessions/${id}`);
    },
    getActive(chamberId: string) {
      return request(`/api/v1/chambers/${chamberId}/sessions/active`);
    },
    updateStatus(id: string, status: string) {
      return request(`/api/v1/sessions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  queue: {
    getState(sessionId: string) {
      return request(`/api/v1/sessions/${sessionId}/queue`);
    },
    checkIn(sessionId: string, data: { patientId: string; priority?: number; notes?: string }) {
      return request(`/api/v1/sessions/${sessionId}/queue/check-in`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    next(sessionId: string) {
      return request(`/api/v1/sessions/${sessionId}/queue/next`, { method: 'POST' });
    },
    skip(sessionId: string) {
      return request(`/api/v1/sessions/${sessionId}/queue/skip`, { method: 'POST' });
    },
    cancel(sessionId: string, entryId: string) {
      return request(`/api/v1/sessions/${sessionId}/queue/entries/${entryId}`, {
        method: 'DELETE',
      });
    },
  },
};
