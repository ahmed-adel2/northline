import Link from "next/link";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/internal/confirm-button";
import { appointments, getDb, patients, staffMembers, tasks } from "@/db";
import { can, getSession } from "@/lib/auth";
import { fmtDate, fmtTime, parsePatientCode, patientCode, waLink } from "@/lib/format";
import { archivePatient } from "../actions";

export default async function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const no = parsePatientCode(id);
  if (no === null) notFound();

  const db = getDb();
  const [p] = await db.select().from(patients).where(eq(patients.patientNo, no)).limit(1);
  if (!p) notFound();
  const session = await getSession();
  const code = patientCode(p.patientNo);

  const [appts, openTasks] = await Promise.all([
    db.select({ a: appointments, doctor: staffMembers.fullName })
      .from(appointments).leftJoin(staffMembers, eq(appointments.doctorId, staffMembers.id))
      .where(eq(appointments.patientId, p.id)).orderBy(desc(appointments.apptDate), asc(appointments.startTime)).limit(20),
    db.select().from(tasks).where(and(eq(tasks.patientId, p.id), ne(tasks.status, "done"))).limit(10),
  ]);

  return (
    <div className="patient-profile-wrap">
      <div className="page-header">
        <div>
          <Link href="/patients" className="back-link">← Return to patient directory</Link>
          <div className="page-header-tag" style={{ marginTop: "0.4rem" }}>
            <span>Electronic Dental Record</span>
          </div>
          <h1>{p.fullName}</h1>
          <p className="page-header-sub">
            Medical Record {code} · <span className={`badge badge-${p.status}`}>{p.status}</span>{p.archivedAt ? " · Archived record" : ""}
          </p>
        </div>
        <div className="header-actions">
          <Link className="button button-primary" href={`/calendar/new?patient=${p.id}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Book visit</span>
          </Link>
          <Link className="button button-secondary" href={`/patients/${code}/edit`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit profile</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="m-quick" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
        <a className="button button-secondary" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} style={{ minHeight: "44px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Call {p.phone}</span>
        </a>
        <a className="button button-secondary" href={waLink(p.phone)} target="_blank" rel="noopener noreferrer" style={{ minHeight: "44px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>WhatsApp</span>
        </a>
        <Link className="button button-secondary" href="/clinical" style={{ minHeight: "44px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <span>View Odontogram</span>
        </Link>
        <Link className="button button-secondary" href="/treatment-plans" style={{ minHeight: "44px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-icon" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Treatment Plans</span>
        </Link>
      </div>

      {p.allergies.length > 0 && (
        <div className="alert alert-warning" role="note" style={{ marginBottom: "1rem" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span><strong>Medical Alert / Allergies:</strong> {p.allergies.join(", ")}</span>
        </div>
      )}

      {/* Patient Profile Facts */}
      <section className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <h2 className="card-title" style={{ marginTop: 0, fontSize: "1.1rem", marginBottom: "1rem" }}>Demographics &amp; Insurance Details</h2>
        <dl className="m-facts">
          <div><dt>Phone</dt><dd>{p.phone}</dd></div>
          <div><dt>Email</dt><dd>{p.email ?? "—"}</dd></div>
          <div><dt>Date of birth</dt><dd>{fmtDate(p.dob)}</dd></div>
          <div><dt>Gender</dt><dd>{p.gender ?? "—"}</dd></div>
          <div><dt>Blood type</dt><dd><strong style={{ color: "var(--clinic-teal-deep)" }}>{p.bloodType ?? "—"}</strong></dd></div>
          <div><dt>National ID</dt><dd>{p.nationalId ?? "—"}</dd></div>
          <div><dt>Insurance</dt><dd>{p.insuranceProvider ? `${p.insuranceProvider}${p.insuranceMemberId ? ` · ${p.insuranceMemberId}` : ""}` : "—"}</dd></div>
          <div><dt>Loyalty points</dt><dd><span className="amount-tag">{p.loyaltyPoints} pts</span></dd></div>
          <div style={{ gridColumn: "1 / -1" }}><dt>Address</dt><dd>{p.address ?? "—"}</dd></div>
          <div style={{ gridColumn: "1 / -1" }}><dt>Clinical Notes</dt><dd>{p.notes ?? "—"}</dd></div>
        </dl>
      </section>

      {/* Appointment History */}
      <section className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="card-title" style={{ margin: 0, fontSize: "1.1rem" }}>Appointment History</h2>
          <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)" }}>{appts.length} record{appts.length !== 1 ? "s" : ""}</span>
        </div>
        {appts.length === 0 ? (
          <p className="m-empty" style={{ margin: 0, padding: "1rem", background: "var(--clinic-ground)", borderRadius: "var(--radius-md)" }}>
            No appointments yet. Use “Book visit” above to schedule an appointment.
          </p>
        ) : (
          <ul className="m-list">
            {appts.map(({ a, doctor }) => (
              <li key={a.id}>
                <Link href={`/calendar/${a.id}`} className="m-row" style={{ minHeight: "44px" }}>
                  <span className="m-row-title">{a.procedure}</span>
                  <span className="m-row-sub">{fmtDate(a.apptDate)} · {fmtTime(a.startTime)} · {doctor ?? "Unassigned"}</span>
                  <span className="m-row-end"><span className={`badge badge-${a.status}`}>{a.status}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Open Tasks */}
      {openTasks.length > 0 && (
        <section className="card" style={{ padding: "1.25rem 1.5rem" }}>
          <h2 className="card-title" style={{ marginTop: 0, fontSize: "1.1rem", marginBottom: "1rem" }}>Open Clinical Tasks</h2>
          <ul className="m-list">
            {openTasks.map((t) => (
              <li key={t.id} className="m-row" style={{ minHeight: "44px" }}>
                <span className="m-row-title">{t.title}</span>
                <span className="m-row-sub">Due {fmtDate(t.dueDate)}</span>
                <span className="m-row-end"><span className={`badge badge-${t.priority}`}>{t.priority}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Connected Clinical & Financial Records */}
      <section className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <h2 className="card-title" style={{ marginTop: 0, fontSize: "1.1rem", marginBottom: "0.75rem" }}>Treatment Plans &amp; Billing History</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <Link href="/treatment-plans" className="card" style={{ padding: "1rem", textDecoration: "none", background: "var(--clinic-ground)", border: "1px solid var(--clinic-hairline)" }}>
            <span style={{ fontWeight: 650, fontSize: "0.9rem", color: "var(--clinic-ink)", display: "block" }}>Active Care Plans</span>
            <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)", display: "block", marginTop: "0.25rem" }}>View multi-stage procedures and patient consents</span>
          </Link>
          <Link href="/invoices" className="card" style={{ padding: "1rem", textDecoration: "none", background: "var(--clinic-ground)", border: "1px solid var(--clinic-hairline)" }}>
            <span style={{ fontWeight: 650, fontSize: "0.9rem", color: "var(--clinic-ink)", display: "block" }}>Billing &amp; Statements</span>
            <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)", display: "block", marginTop: "0.25rem" }}>Track invoices, balances, and payment receipts</span>
          </Link>
          <Link href="/clinical" className="card" style={{ padding: "1rem", textDecoration: "none", background: "var(--clinic-ground)", border: "1px solid var(--clinic-hairline)" }}>
            <span style={{ fontWeight: 650, fontSize: "0.9rem", color: "var(--clinic-ink)", display: "block" }}>Anatomical Chart</span>
            <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)", display: "block", marginTop: "0.25rem" }}>Inspect FDI tooth findings, crowns, and implants</span>
          </Link>
        </div>
      </section>

      {can(session.role, "patients:archive") && !p.archivedAt && (
        <div style={{ marginTop: "0.5rem" }}>
          <form action={archivePatient.bind(null, code)}>
            <ConfirmButton className="button button-secondary m-danger" message={`Archive ${p.fullName}? They will be hidden from lists. Records are kept.`}>
              Archive patient
            </ConfirmButton>
          </form>
        </div>
      )}
    </div>
  );
}
