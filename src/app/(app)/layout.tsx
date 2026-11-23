import "@/app/(app)/internal.css";
import "@/app/(app)/polish.css";
import "@/app/(app)/mobile.css";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/internal/sidebar";
import { TopBar } from "@/components/internal/topbar";
import { MobileNav } from "@/components/internal/mobile-nav";
import { getSession } from "@/lib/auth";
import { and, count, lte, ne } from "drizzle-orm";
import { getDb, tasks } from "@/db";
import { todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getDueTaskCount() {
  try {
    const [r] = await getDb().select({ n: count() }).from(tasks)
      .where(and(ne(tasks.status, "done"), lte(tasks.dueDate, todayISO())));
    return r?.n ?? 0;
  } catch {
    return 0;
  }
}

export default async function StaffLayout({ children }: Readonly<{ children: ReactNode }>) {
  let role: string | undefined;
  try {
    const s = await getSession();
    role = s.role;
  } catch {
    // If auth redirects or fails in unauthenticated/static context
  }

  const dueTasks = await getDueTaskCount();

  return (
    <div className="internal-shell">
      <Sidebar taskDueCount={dueTasks} />
      <TopBar role={role} dueCount={dueTasks} />
      <div className="internal-body">
        <main className="internal-content">
          <div className="internal-container">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
