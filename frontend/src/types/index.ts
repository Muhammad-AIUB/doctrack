export enum UserRole {
  DOCTOR = 'DOCTOR',
  ASSISTANT = 'ASSISTANT',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
}

export enum QueuePriority {
  EMERGENCY = 1,
  VIP = 2,
  FOLLOW_UP = 3,
  REGULAR = 4,
}

export enum QueueEntryStatus {
  WAITING = 'WAITING',
  IN_CONSULTATION = 'IN_CONSULTATION',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface Chamber {
  id: string;
  doctorId: string;
  name: string;
  address?: string;
  defaultAvgDurationMin: number;
  maxPatientsPerSession?: number;
}

export interface DailySession {
  id: string;
  chamberId: string;
  sessionDate: string;
  status: SessionStatus;
  totalPatientsServed: number;
  etaWindowSize: number;
}

export interface QueueStateSnapshot {
  currentPatient: {
    entryId: string;
    patientId: string;
    serialNumber: number;
    priority: QueuePriority;
  } | null;
  queue: Array<{
    entryId: string;
    patientId: string;
    serialNumber: number;
    position: number;
    priority: QueuePriority;
    estimatedWaitSec: number;
  }>;
  stats: {
    totalWaiting: number;
    avgDurationSec: number;
    totalServed: number;
  };
}

export interface QueueUpdateEvent {
  type: 'QUEUE_UPDATED' | 'PATIENT_CALLED' | 'SESSION_PAUSED' | 'SESSION_ENDED';
  sessionId: string;
  timestamp: string;
  sequence: number;
  data: QueueStateSnapshot;
}
