export enum UserRole {
  DOCTOR = 'DOCTOR',
  ASSISTANT = 'ASSISTANT',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
