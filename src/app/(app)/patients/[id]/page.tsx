import Link from "next/link";
import { notFound } from "next/navigation";
import "@/app/(app)/internal.css";
import {
  demoPatients,
  formatDate,
  formatCurrency,
  getAppointmentsForPatient,
  getTreatmentPlansForPatient,
  getInvoicesForPatient,
} from "@/lib/demo-data";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function generateStaticParams() {
  return demoPatients.map(({ id }) => ({ id }));
}

export default async function PatientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = demoPatients.find((p) => p.id === id);
  if (!patient) notFound();

  const appointments = getAppointmentsForPatient(id);
  const plans = getTreatmentPlansForPatient(id);
  const invoices = getInvoicesForPatient(id);

  return (
    <div className="patient-profile-wrap">
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/patients" className="back-link">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Patients
            </Link>
            <span style={{ color: "var(--clinic-hairline)" }}>/</span>
            <span style={{ color: "var(--clinic-muted)", fontSize: "0.82rem" }}>{patient.id}</span>
          </div>
          <h1 style={{ margin: "0.35rem 0 0", fontSize: "clamp(1.35rem, 3vw, 1.75rem)", letterSpacing: "-0.025em" }}>
            {patient.name}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="button button-secondary" type="button">Edit</button>
          <Link href={`/qr?patient=${patient.id}`} className="button button-secondary">
            QR code <ArrowUpRight />
          </Link>
          <Link href="/calendar" className="button button-primary">
            Book appointment <ArrowUpRight />
          </Link>
        </div>
      </div>

      <div className="patient-profile-grid">
        {/* Demographics */}
        <section className="card patient-profile-body">
          <div className="card-header" style={{ borderBottom: "1px solid var(--clinic-hairline)", marginBottom: "1rem" }}>
            <h2>Patient details</h2>
            <span className={`badge badge-${patient.status}`}>{patient.status}</span>
          </div>
          <dl className="patient-facts">
            {[
              ["Patient ID", patient.id],
              ["Date of birth", formatDate(patient.dob)],
              ["Gender", patient.gender],
              ["Phone", patient.phone],
              ["Email", patient.email],
              ["National ID", patient.nationalId],
              ["Address", patient.address],
              ["Blood type", patient.bloodType],
              ["Allergies", patient.allergies.length ? patient.allergies.join(", ") : "None recorded"],
              ["Insurance", patient.insurance ?? "—"],
              ["Member ID", patient.insuranceMemberId ?? "—"],
              ["Loyalty points", String(patient.loyaltyPoints)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {patient.notes && (
            <div className="patient-notes">
              <span className="patient-notes-label">Notes</span>
              <p>{patient.notes}</p>
            </div>
          )}
          <div className="patient-balance-bar">
            <span>Outstanding balance</span>
            <span className={patient.balance < 0 ? "balance-owed" : "balance-clear"}>
              {patient.balance < 0
                ? `EGP ${formatCurrency(patient.balance)} owed`
                : "Settled"}
            </span>
          </div>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Appointments */}
          <section className="card patient-profile-body">
            <div className="card-header" style={{ borderBottom: "1px solid var(--clinic-hairline)", marginBottom: "1rem" }}>
              <h2>Appointments</h2>
              <Link href="/calendar" className="button-link">Book <ArrowUpRight /></Link>
            </div>
            {appointments.length === 0 ? (
              <p className="empty-state-text">No appointments recorded.</p>
            ) : (
              <ul className="appt-history-list">
                {appointments.map((a) => (
                  <li key={a.id} className="appt-history-item">
                    <div className="appt-history-meta">
                      <span className="appt-time">{a.date} · {a.startTime}</span>
                      <span className={`badge badge-appt-${a.status.replace(/-/g, "")}`}>{a.status.replace(/-/g, " ")}</span>
                    </div>
                    <div className="appt-history-detail">
                      <strong>{a.procedure}</strong>
                      <span style={{ color: "var(--clinic-muted)", fontSize: "0.78rem" }}>{a.doctorName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Treatment Plans */}
          <section className="card patient-profile-body">
            <div className="card-header" style={{ borderBottom: "1px solid var(--clinic-hairline)", marginBottom: "1rem" }}>
              <h2>Treatment plans</h2>
              <Link href="/treatment-plans" className="button-link">View all <ArrowUpRight /></Link>
            </div>
            {plans.length === 0 ? (
              <p className="empty-state-text">No treatment plans on file.</p>
            ) : (
              <ul className="plan-list">
                {plans.map((plan) => (
                  <li key={plan.id} className="plan-item">
                    <div className="plan-header-row">
                      <span className="patient-id">{plan.id}</span>
                      <span className={`badge badge-plan-${plan.status}`}>{plan.status}</span>
                    </div>
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--clinic-muted)" }}>
                      {plan.items.length} items · EGP {formatCurrency(plan.totalAmount)} total · EGP {formatCurrency(plan.paidAmount)} paid
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Invoices */}
          <section className="card patient-profile-body">
            <div className="card-header" style={{ borderBottom: "1px solid var(--clinic-hairline)", marginBottom: "1rem" }}>
              <h2>Invoices</h2>
              <Link href="/invoices" className="button-link">View all <ArrowUpRight /></Link>
            </div>
            {invoices.length === 0 ? (
              <p className="empty-state-text">No invoices issued.</p>
            ) : (
              <ul className="invoice-list">
                {invoices.map((inv) => (
                  <li key={inv.id} className="invoice-item">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="patient-id">{inv.id}</span>
                      <span className={`badge badge-inv-${inv.status}`}>{inv.status}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem", fontSize: "0.82rem" }}>
                      <span style={{ color: "var(--clinic-muted)" }}>{formatDate(inv.issueDate)}</span>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 550 }}>
                        EGP {formatCurrency(inv.total)}
                        {inv.balance > 0 && (
                          <span style={{ color: "var(--clinic-danger)", marginLeft: "0.4rem" }}>
                            ({formatCurrency(inv.balance)} due)
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
