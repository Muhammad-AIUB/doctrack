'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const pathname = usePathname();
  const hideNav = pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--dt-border)] bg-[var(--dt-surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-[var(--dt-fg)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--dt-primary)] text-sm font-bold text-white shadow-md shadow-[var(--dt-primary)]/25 transition-transform group-hover:scale-[1.02]">
            Dt
          </span>
          <span className="hidden sm:inline">
            <span className="text-[var(--dt-fg)]">Doc</span>
            <span className="text-[var(--dt-primary)]">Track</span>
          </span>
        </Link>
        {!hideNav && (
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/queue"
              className="rounded-lg px-3 py-2 text-[var(--dt-fg-muted)] transition-colors hover:bg-[var(--dt-muted)] hover:text-[var(--dt-fg)]"
            >
              Queue
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-[var(--dt-fg-muted)] transition-colors hover:bg-[var(--dt-muted)] hover:text-[var(--dt-fg)]"
            >
              Dashboard
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
