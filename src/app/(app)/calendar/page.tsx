import Link from "next/link";
import { and, asc, between, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { appointments, getDb, patients, staffMembers } from "@/db";
import { setAppointmentStatus } from "./actions";
import { addDays, fmtDate, fmtMoney, fmtTime, patientCode, todayISO } from "@/lib/format";

export const metadata = { title: "Schedule & Calendar — Northline Dental Clinic" };

const NEXT: Record<string, { to: string; label: string }[]> = {
  scheduled: [
    { to: "confirmed", label: "Confirm" },
    { to: "checked-in", label: "Check in" },
  ],
  confirmed: [{ to: "checked-in", label: "Check in" }],
  "checked-in": [{ to: "in-progress", label: "Start treatment" }],
  "in-progress": [{ to: "completed", label: "Complete visit" }],
};

export default async function Calendar({
  searchParams,
}: {
  searchParams: Promise<{ d?: string; doc?: string }>;
}) {
  await getSession();
  const sp = await searchParams;
  const today = todayISO();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(sp.d ?? "") ? sp.d! : today;
  const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
  const week = Array.from({ length: 7 }, (_, i) => addDays(d, i - dow));

  const db = getDb();
  const [doctors, rows, weekCounts] = await Promise.all([
    db
      .select()
      .from(staffMembers)
      .where(and(eq(staffMembers.role, "dentist"), eq(staffMembers.active, true)))
      .orderBy(asc(staffMembers.fullName)),
    db
      .select({
        a: appointments,
        patient: patients.fullName,
        no: patients.patientNo,
        doctor: staffMembers.fullName,
        color: staffMembers.color,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(staffMembers, eq(appointments.doctorId, staffMembers.id))
      .where(
        and(
          eq(appointments.apptDate, d),
          sp.doc ? eq(appointments.doctorId, sp.doc) : undefined
        )
      )
      .orderBy(asc(appointments.startTime)),
    db
      .select({ day: appointments.apptDate, n: sql<number>`count(*)::int` })
      .from(appointments)
      .where(between(appointments.apptDate, week[0], week[6]))
      .groupBy(appointments.apptDate),
  ]);

  const has = new Set(weekCounts.map((w) => w.day));
  const q = (date: string, doc = sp.doc) =>
    `/calendar?d=${date}${doc ? `&doc=${doc}` : ""}`;
  const label = new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  const isToday = d === today;

  return (
    <div className="calendar-page-wrap">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Clinic Operatory Schedule</span>
          </div>
          <h1>{label}</h1>
          <p className="page-header-sub">
            {rows.length} {rows.length === 1 ? "appointment" : "appointments"} scheduled
            {isToday && (
              <> · <span className="live-pulse-dot" aria-hidden="true" />{" "}<strong>Today</strong></>
            )}
          </p>
        </div>
        <div className="header-actions">
          <Link href={`/calendar/new?d=${d}`} className="button button-primary">
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
            <span>+ Book appointment</span>
          </Link>
        </div>
      </div>

      {/* ── Week Navigator ────────────────────────────────── */}
      <div className="card calendar-nav-card">
        <div className="calendar-week-controls">
          <Link
            className="button button-secondary"
            href={q(addDays(d, -7))}
            aria-label="Previous week"
          >
            ← Prev week
          </Link>
          <Link
            className="button button-secondary today-nav-btn"
            href={q(today)}
            aria-current={isToday ? "true" : undefined}
          >
            Today
          </Link>
          <Link
            className="button button-secondary"
            href={q(addDays(d, 7))}
            aria-label="Next week"
          >
            Next week →
          </Link>
        </div>

        <nav className="m-week" aria-label="Week dates">
          {week.map((w) => (
            <Link
              key={w}
              href={q(w)}
              className={`m-day${w === d ? " on" : ""}${w === today ? " today" : ""}`}
              aria-current={w === d ? "date" : undefined}
            >
              <span className="m-day-name">
                {new Date(`${w}T00:00:00Z`).toLocaleDateString("en-GB", {
                  weekday: "short",
                  timeZone: "UTC",
                })}
              </span>
              <b className="m-day-num">{Number(w.slice(8))}</b>
              <span className={`m-day-dot ${has.has(w) ? "has-appts" : ""}`} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {doctors.length > 0 && (
          <div className="calendar-doctor-filter" role="group" aria-label="Filter by doctor">
            <span className="filter-title">Doctor:</span>
            <Link
              href={q(d, "")}
              className={`filter-chip${!sp.doc ? " filter-chip-active" : ""}`}
            >
              All Doctors ({rows.length})
            </Link>
            {doctors.map((doc) => (
              <Link
                key={doc.id}
                href={q(d, doc.id)}
                className={`filter-chip${sp.doc === doc.id ? " filter-chip-active" : ""}`}
              >
                <span
                  className="doctor-filter-dot"
                  style={{ backgroundColor: doc.color ?? "#087f80" }}
                  aria-hidden="true"
                />
                {doc.fullName}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Appointment List / Timeline ───────────────────── */}
      {rows.length === 0 ? (
        <div className="card">
          <div className="m-empty" style={{ padding: "3.5rem 1.5rem" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="empty-icon"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3>No appointments for {fmtDate(d)}</h3>
            <p>Treatment rooms are open and available for bookings.</p>
            <Link className="button button-primary" href={`/calendar/new?d=${d}`}>
              + Book an appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>Appointments Timeline ({rows.length})</h2>
            <span className="card-subtitle">{fmtDate(d)}</span>
          </div>
          <div className="card-body">
            <ul className="m-list" style={{ gridTemplateColumns: "1fr" }}>
              {rows.map(({ a, patient, no, doctor, color }) => (
                <li
                  key={a.id}
                  className="m-appt"
                  style={{ ["--doc" as string]: color ?? undefined }}
                >
                  <div className="m-appt-top">
                    <span className="m-appt-time">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: "0.85rem", height: "0.85rem" }}
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {fmtTime(a.startTime)} – {fmtTime(a.endTime)}
                    </span>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>

                  <div className="m-appt-patient-details">
                    <Link
                      href={`/patients/${patientCode(no)}`}
                      className="m-row-title"
                    >
                      {patient}{" "}
                      <span className="patient-code-tag">({patientCode(no)})</span>
                    </Link>
                    <div className="m-row-sub">
                      <span className="procedure-tag">{a.procedure}</span>
                      <span className="meta-sep">·</span>
                      <span className="doctor-tag">Dr. {doctor ?? "Unassigned"}</span>
                      {a.room && (
                        <>
                          <span className="meta-sep">·</span>
                          <span className="room-tag">Room {a.room}</span>
                        </>
                      )}
                      {Number(a.amount) > 0 && (
                        <>
                          <span className="meta-sep">·</span>
                          <span className="amount-tag">{fmtMoney(a.amount)}</span>
                        </>
                      )}
                    </div>
                    {a.notes && (
                      <div className="m-appt-notes">{a.notes}</div>
                    )}
                  </div>

                  <div className="m-appt-btns">
                    {(NEXT[a.status] ?? []).map((n) => (
                      <form key={n.to} action={setAppointmentStatus.bind(null, a.id, n.to)}>
                        <button
                          className={`button ${
                            n.to === NEXT[a.status][0].to
                              ? "button-primary"
                              : "button-secondary"
                          }`}
                        >
                          {n.label}
                        </button>
                      </form>
                    ))}
                    {["scheduled", "confirmed", "checked-in"].includes(a.status) && (
                      <form action={setAppointmentStatus.bind(null, a.id, "no-show")}>
                        <button className="button button-secondary">No-show</button>
                      </form>
                    )}
                    <Link
                      href={`/calendar/${a.id}`}
                      className="button button-secondary"
                    >
                      Edit / Move
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
