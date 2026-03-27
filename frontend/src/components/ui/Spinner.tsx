export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-9 w-9 animate-spin rounded-full border-2 border-[var(--dt-muted)] border-t-[var(--dt-primary)] ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
