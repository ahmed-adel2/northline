import "@/app/(app)/internal.css";
import { demoClaims, formatDate, formatCurrency } from "@/lib/demo-data";
import Link from "next/link";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Insurance() {
  const activeClaims = demoClaims.filter((c) => c.status !== "draft");
  const approvedTotal = demoClaims.filter((c) => c.status === "approved").reduce((s, c) => s + (c.approvedAmount ?? 0), 0);
  const pendingTotal = demoClaims.filter((c) => c.status === "submitted" || c.status === "pending").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="insurance-wrap">
      <div className="page-header">
        <div>
          <h1>Insurance &amp; Claims</h1>
          <p>{activeClaims.length} active claims · synthetic demo data</p>
        </div>
        <button type="button" className="button button-primary">
          New claim <ArrowUpRight />
        </button>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total claims", value: String(demoClaims.length) },
          { label: "Approved", value: `EGP ${formatCurrency(approvedTotal)}`, trend: "up" },
          { label: "Pending review", value: `EGP ${formatCurrency(pendingTotal)}`, trend: "neutral" },
          { label: "Rejected / draft", value: String(demoClaims.filter((c) => c.status === "rejected" || c.status === "draft").length) },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value" style={{ fontSize: "1.5rem" }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table" aria-label="Insurance claims">
          <thead>
            <tr>
              <th scope="col">Claim ID</th>
              <th scope="col">Invoice</th>
              <th scope="col">Patient</th>
              <th scope="col">Insurer</th>
              <th scope="col">Member ID</th>
              <th scope="col">Submitted</th>
              <th scope="col" style={{ textAlign: "right" }}>Claimed</th>
              <th scope="col" style={{ textAlign: "right" }}>Approved</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoClaims.map((claim) => (
              <tr key={claim.id}>
                <td className="patient-id">{claim.id}</td>
                <td className="patient-id">{claim.invoiceId}</td>
                <td>
                  <Link href={`/patients/${claim.patientId}`} className="patient-name">
                    {claim.patientName}
                  </Link>
                </td>
                <td style={{ fontSize: "0.82rem" }}>{claim.insurance || "—"}</td>
                <td className="numeric">{claim.memberId || "—"}</td>
                <td className="numeric">{claim.submittedDate ? formatDate(claim.submittedDate) : "—"}</td>
                <td className="numeric" style={{ textAlign: "right" }}>
                  {claim.amount > 0 ? `EGP ${formatCurrency(claim.amount)}` : "—"}
                </td>
                <td className="numeric" style={{ textAlign: "right" }}>
                  {claim.approvedAmount != null ? (
                    <span style={{ color: "var(--clinic-success)" }}>EGP {formatCurrency(claim.approvedAmount)}</span>
                  ) : "—"}
                </td>
                <td><span className={`badge badge-claim-${claim.status}`}>{claim.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provider breakdown */}
      <section className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header"><h2>Insurance providers on file</h2></div>
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {["Misr Insurance", "GlobeMed Egypt", "AXA Egypt", "Allianz Egypt"].map((provider) => {
            const count = demoClaims.filter((c) => c.insurance === provider).length;
            return (
              <div key={provider} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0", borderBottom: "1px solid var(--clinic-hairline)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--clinic-radius-sm)", background: "var(--clinic-teal-tint)", display: "grid", placeItems: "center" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--clinic-teal)" strokeWidth="2" width="14" height="14" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 550, fontSize: "0.88rem" }}>{provider}</span>
                </div>
                <span className="badge badge-active">{count} claim{count !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
