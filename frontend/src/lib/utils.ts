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
    case QueuePriority.EMERGENCY:
      return 'bg-red-100 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800/60';
    case QueuePriority.VIP:
      return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/50';
    case QueuePriority.FOLLOW_UP:
      return 'bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/50';
    case QueuePriority.REGULAR:
      return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-600';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-600';
  }
}
