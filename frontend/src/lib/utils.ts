import { QueuePriority } from '@/types';

export function formatWaitTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function priorityLabel(priority: QueuePriority): string {
  switch (priority) {
    case QueuePriority.EMERGENCY: return 'Emergency';
    case QueuePriority.VIP: return 'VIP';
    case QueuePriority.FOLLOW_UP: return 'Follow-up';
    case QueuePriority.REGULAR: return 'Regular';
    default: return 'Regular';
  }
}

export function priorityColor(priority: QueuePriority): string {
  switch (priority) {
    case QueuePriority.EMERGENCY: return 'bg-red-100 text-red-800 border-red-300';
    case QueuePriority.VIP: return 'bg-amber-100 text-amber-800 border-amber-300';
    case QueuePriority.FOLLOW_UP: return 'bg-blue-100 text-blue-800 border-blue-300';
    case QueuePriority.REGULAR: return 'bg-gray-100 text-gray-800 border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
