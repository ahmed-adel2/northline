import Link from "next/link";
import { and, asc, count, eq, isNull, lte, ne } from "drizzle-orm";
import { appointments, getDb, patients, staffMembers, tasks } from "@/db";
import { getSession } from "@/lib/auth";
import { fmtDate, fmtTime, patientCode, todayISO } from "@/lib/format";

export const metadata = { title: "Dashboard — Northline Dental Clinic" };

export default async function Dashboard() {
  const session = await getSession();
  const today = todayISO();
  const db = getDb();

  const [todays, [{ pts }], [{ open }], dueTasks] = await Promise.all([
    db
      .select({ a: appointments, patient: patients.fullName, no: patients.patientNo, doctor: staffMembers.fullName })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staffMembers, eq(appointments.doctorId, staffMembers.id))
      .where(and(eq(appointments.apptDate, today), ne(appointments.status, "cancelled")))
      .orderBy(asc(appointments.startTime)),
    db.select({ pts: count() }).from(patients).where(isNull(patients.archivedAt)),
    db.select({ open: count() }).from(tasks).where(ne(tasks.status, "done")),
    db
      .select()
      .from(tasks)
      .where(and(ne(tasks.status, "done"), lte(tasks.dueDate, today)))
      .orderBy(asc(tasks.dueDate))
      .limit(5),
  ]);

  const waiting = todays.filter((t) => t.a.status === "checked-in").length;
  const inProgress = todays.filter((t) => t.a.status === "in-progress").length;
  const done = todays.filter((t) => t.a.status === "completed").length;
  const remaining = todays.filter((t) => !["completed", "no-show"].includes(t.a.status));
  const completionPct = todays.length > 0 ? Math.round((done / todays.length) * 100) : 0;

  const firstName = session.name.split(" ")[0];

  return (
    <div className="dashboard-wrap">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-title-group">
          <div className="page-header-tag">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>Clinic Operational · Main Branch</span>
          </div>
          <h1>Good day, {firstName}</h1>
          <p className="page-header-sub">
            {fmtDate(today)} · Signed in as{" "}
            <strong className="user-role-label">{session.role}</strong>
          </p>
        </div>
        <div className="header-actions">
          <Link href="/patients/new" className="button button-secondary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-icon"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>New patient</span>
          </Link>
          <Link href="/calendar/new" className="button button-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-icon"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="12" y1="14" x2="12" y2="18" />
              <line x1="10" y1="16" x2="14" y2="16" />
            </svg>
            <span>Book visit</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="kpi-grid kpi-grid-4">
        {/* Today's visits */}
        <Link href="/calendar" className="kpi-card kpi-card-link">
          <div className="kpi-top">
            <span className="kpi-icon-wrap kpi-icon-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span className="kpi-badge kpi-badge-teal">{done} completed</span>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">{"Today's visits"}</div>
            <div className="kpi-value">{todays.length}</div>
            <div className="kpi-micro-sub">
              {remaining.length} remaining · {completionPct}% done
            </div>
          </div>
        </Link>

        {/* Waiting */}
        <Link href="/calendar" className="kpi-card kpi-card-link">
          <div className="kpi-top">
            <span className="kpi-icon-wrap kpi-icon-amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span className={`kpi-badge ${waiting > 0 ? "kpi-badge-amber" : "kpi-badge-neutral"}`}>
              {waiting > 0 ? "In reception" : "Clear"}
            </span>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Waiting now</div>
            <div className="kpi-value">{waiting}</div>
            <div className="kpi-micro-sub">
              {inProgress > 0 ? `${inProgress} in treatment` : "Chairs ready"}
            </div>
          </div>
        </Link>

        {/* Open tasks */}
        <Link href="/tasks" className="kpi-card kpi-card-link">
          <div className="kpi-top">
            <span className="kpi-icon-wrap kpi-icon-rose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            {dueTasks.length > 0 && (
              <span className="kpi-badge kpi-badge-rose">{dueTasks.length} due today</span>
            )}
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Open tasks</div>
            <div className="kpi-value">{open}</div>
            <div className="kpi-micro-sub">
              {dueTasks.length > 0 ? "Needs attention" : "All up to date"}
            </div>
          </div>
        </Link>

        {/* Patients */}
        <Link href="/patients" className="kpi-card kpi-card-link">
          <div className="kpi-top">
            <span className="kpi-icon-wrap kpi-icon-indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="kpi-badge kpi-badge-indigo">Active files</span>
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Registered patients</div>
            <div className="kpi-value">{pts}</div>
            <div className="kpi-micro-sub">Electronic dental records</div>
          </div>
        </Link>
      </div>

      {/* ── Main 2-Column Grid ────────────────────────────── */}
      <div className="dashboard-grid">
        {/* ── Left: Today's Schedule ── */}
        <section className="card dashboard-main-card">
          <div className="card-header">
            <div className="card-title-group">
              <h2>{"Today's Appointments"} ({todays.length})</h2>
              <span className="card-subtitle">
                {remaining.length} remaining · {done} completed
              </span>
            </div>
            <Link href="/calendar" className="button-link">
              View schedule →
            </Link>
          </div>

          <div className="card-body">
            {/* Progress bar */}
            {todays.length > 0 && (
              <div className="schedule-progress-bar-wrap" aria-label={`${completionPct}% of today's appointments completed`}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${completionPct}%` }} />
                </div>
                <span className="progress-label">{completionPct}%</span>
              </div>
            )}

            {remaining.length === 0 ? (
              <div className="m-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-icon" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>All done for today!</h3>
                <p>No remaining visits scheduled for {fmtDate(today)}.</p>
                <Link className="button button-primary" href="/calendar/new">
                  + Book appointment
                </Link>
              </div>
            ) : (
              <ul className="m-list" style={{ gridTemplateColumns: "1fr" }}>
                {remaining.map(({ a, patient, no, doctor }) => (
                  <li key={a.id}>
                    <Link href={`/patients/${patientCode(no)}`} className="m-row">
                      <div className="m-row-main">
                        <div className="m-row-time-tag">
                          <span className="m-time-start">{fmtTime(a.startTime)}</span>
                          <span className="m-time-sep">–</span>
                          <span className="m-time-end">{fmtTime(a.endTime)}</span>
                        </div>
                        <span className="m-row-title">{patient}</span>
                      </div>
                      <div className="m-row-sub">
                        <span className="procedure-tag">{a.procedure}</span>
                        <span className="meta-sep"> - </span>
                        <span className="doctor-tag">{doctor ?? "Unassigned"}</span>
                        {a.room && (
                          <>
                            <span className="meta-sep">·</span>
                            <span className="room-tag">Room {a.room}</span>
                          </>
                        )}
                      </div>
                      <span className="m-row-end">
                        <span className={`badge badge-${a.status}`}>{a.status}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Right: Side Stack ── */}
        <div className="dashboard-side-stack">
          {/* Quick Actions */}
          <section className="card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="action-grid">
              <Link href="/clinical" className="action-button">
                <div className="action-icon action-icon-teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2C8 2 5 5 5 9c0 2.5 1 4.5 2.5 6L9 21h6l1.5-6C18 13.5 19 11.5 19 9c0-4-3-7-7-7z" />
                  </svg>
                </div>
                <span>Tooth Chart</span>
              </Link>
              <Link href="/treatment-plans" className="action-button">
                <div className="action-icon action-icon-indigo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <span>Treatment Plans</span>
              </Link>
              <Link href="/invoices" className="action-button">
                <div className="action-icon action-icon-amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <span>Invoices</span>
              </Link>
              <Link href="/qr" className="action-button">
                <div className="action-icon action-icon-purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <span>Check-in QR</span>
              </Link>
            </div>
          </section>

          {/* Pending Tasks */}
          <section className="card">
            <div className="card-header">
              <h2>Pending Tasks</h2>
              <Link href="/tasks" className="button-link">
                All tasks →
              </Link>
            </div>
            <div className="card-body">
              {dueTasks.length === 0 ? (
                <div className="m-empty-compact">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="empty-icon-sm" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Nothing due today — all caught up!</span>
                </div>
              ) : (
                <ul className="m-list" style={{ gridTemplateColumns: "1fr" }}>
                  {dueTasks.map((t) => (
                    <li key={t.id}>
                      <Link href="/tasks?f=due" className="m-row m-row-compact">
                        <div>
                          <span className="m-row-title">{t.title}</span>
                          <span className="m-row-sub">
                            Due {fmtDate(t.dueDate)} · {t.type}
                          </span>
                        </div>
                        <span className="m-row-end">
                          <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
