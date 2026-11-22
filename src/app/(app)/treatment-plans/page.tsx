import "@/app/(app)/internal.css";
import { demoTreatmentPlans, formatDate, formatCurrency } from "@/lib/demo-data";
import Link from "next/link";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TreatmentPlans() {
  return (
    <div className="treatment-wrap">
      <div className="page-header">
        <div>
          <h1>Treatment Plans</h1>
          <p>{demoTreatmentPlans.length} plans · synthetic demo data</p>
        </div>
        <button type="button" className="button button-primary">
          New plan <ArrowUpRight />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {demoTreatmentPlans.map((plan) => {
          const pct = plan.totalAmount > 0 ? Math.round((plan.paidAmount / plan.totalAmount) * 100) : 0;
          return (
            <div key={plan.id} className="card treatment-plan-card">
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="patient-id">{plan.id}</span>
                  <Link href={`/patients/${plan.patientId}`} className="patient-name" style={{ fontSize: "1rem", fontWeight: 600 }}>
                    {plan.patientName}
                  </Link>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)" }}>{plan.doctorName}</span>
                  <span className={`badge badge-plan-${plan.status}`}>{plan.status}</span>
                </div>
              </div>
              <div className="plan-body">
                {/* Progress bar */}
                <div className="plan-progress">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.78rem" }}>
                    <span style={{ color: "var(--clinic-muted)" }}>Payment progress</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 550 }}>
                      EGP {formatCurrency(plan.paidAmount)} / EGP {formatCurrency(plan.totalAmount)} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Items table */}
                <div className="table-wrap" style={{ marginTop: "1rem" }}>
                  <table className="data-table" aria-label={`Treatment items for ${plan.patientName}`}>
                    <thead>
                      <tr>
                        <th scope="col">Tooth</th>
                        <th scope="col">Procedure</th>
                        <th scope="col" style={{ textAlign: "right" }}>Qty</th>
                        <th scope="col" style={{ textAlign: "right" }}>Unit price</th>
                        <th scope="col" style={{ textAlign: "right" }}>Total</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.items.map((item, i) => (
                        <tr key={i}>
                          <td className="numeric">{item.tooth ?? "—"}</td>
                          <td>{item.procedure}</td>
                          <td className="numeric" style={{ textAlign: "right" }}>{item.quantity}</td>
                          <td className="numeric" style={{ textAlign: "right" }}>EGP {formatCurrency(item.unitPrice)}</td>
                          <td className="numeric" style={{ textAlign: "right" }}>EGP {formatCurrency(item.unitPrice * item.quantity)}</td>
                          <td><span className={`badge badge-item-${item.status}`}>{item.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, padding: "0.85rem 1rem" }}>Total</td>
                        <td className="numeric" style={{ textAlign: "right", fontWeight: 600 }}>EGP {formatCurrency(plan.totalAmount)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notes & dates */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--clinic-muted)", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span>Created {formatDate(plan.createdDate)}{plan.approvedDate ? ` · Approved ${formatDate(plan.approvedDate)}` : ""}</span>
                  {plan.notes && <span style={{ fontStyle: "italic" }}>{plan.notes}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
