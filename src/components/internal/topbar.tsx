import { currentUser } from "@clerk/nextjs/server";
import { and, count, lte, ne } from "drizzle-orm";
import { getDb, tasks } from "@/db";
import { todayISO } from "@/lib/format";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

async function dueCount() {
  try {
    const [r] = await getDb().select({ n: count() }).from(tasks)
      .where(and(ne(tasks.status, "done"), lte(tasks.dueDate, todayISO())));
    return r?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function TopBar({ role, dueCount: propDue }: { role?: string; dueCount?: number }) {
  let user = null;
  try {
    user = await currentUser();
  } catch {
    // build time or unauthenticated
  }

  const due = propDue !== undefined ? propDue : await dueCount();
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user?.emailAddresses?.[0]?.emailAddress ?? "Admin";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="branch-switcher" role="group" aria-label="Active branch">
          <span className="branch-status-dot" aria-hidden="true" />
          <svg className="branch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <div className="branch-text-wrap">
            <span className="branch-label">Main Branch</span>
            <span className="branch-sublabel">Downtown Cairo</span>
          </div>
          <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <form className="search-wrap" action="/patients" role="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="search" name="q" placeholder="Search patients by name, phone, or ID…" aria-label="Search patients" />
          <span className="search-shortcut">⌘K</span>
        </form>
      </div>

      <div className="topbar-right">
        <Link href="/tasks?f=due" className="icon-button" aria-label={`${due} tasks due`} title={`${due} tasks due`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {due > 0 && (
            <span className="notification-badge" aria-hidden="true">
              {due > 99 ? "99+" : due}
            </span>
          )}
        </Link>

        <Link href="/" className="public-site-link" title="Open patient public website in new tab" target="_blank" rel="noopener noreferrer">
          <svg className="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Public site</span>
          <svg className="external-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3.5 8.5L8.5 3.5M4 3.5h4.5V8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="user-menu">
          <div className="user-text-info">
            <span className="user-name">{displayName}</span>
            {role && <span className="user-role-badge">{role}</span>}
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
