"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navSections } from "@/components/internal/sidebar";

const ALL = navSections.flatMap((s) => s.items);
const icon = (href: string) => ALL.find((i) => i.href === href)?.icon;
const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/calendar", label: "Schedule" },
  { href: "/patients", label: "Patients" },
  { href: "/tasks", label: "Tasks" },
];

export function MobileNav() {
  const path = usePathname();
  // The sheet is "open" only for the path it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === path;
  const setOpen = (v: boolean) => setOpenAt(v ? path : null);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const on = (h: string) => path === h || path.startsWith(`${h}/`);
  const inTabs = TABS.some((t) => on(t.href));

  return (
    <>
      <nav className="m-nav" aria-label="Primary">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={on(t.href) ? "on" : ""} aria-current={on(t.href) ? "page" : undefined}>
            {icon(t.href)}<span>{t.label}</span>
          </Link>
        ))}
        <button type="button" className={!inTabs || open ? "on" : ""} onClick={() => setOpen(true)} aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
          </svg>
          <span>More</span>
        </button>
      </nav>

      {open && (
        <div className="m-sheet" role="dialog" aria-modal="true" aria-label="All modules">
          <button type="button" className="m-sheet-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="m-sheet-panel">
            <div className="m-sheet-head">
              <strong>All modules</strong>
              <button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Close</button>
            </div>
            {navSections.map((s) => (
              <section key={s.label}>
                <h3>{s.label}</h3>
                <ul>
                  {s.items.map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} className={on(i.href) ? "on" : ""}>{i.icon}<span>{i.label}</span></Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <Link href="/" className="m-sheet-public">View public site</Link>
          </div>
        </div>
      )}
    </>
  );
}
