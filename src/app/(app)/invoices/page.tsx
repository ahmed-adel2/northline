import "@/app/(app)/internal.css";
import { demoInvoices, formatDate, formatCurrency } from "@/lib/demo-data";
import Link from "next/link";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Invoices() {
  const totalRevenue = demoInvoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = demoInvoices.reduce((s, i) => s + i.paid, 0);
  const totalOutstanding = demoInvoices.reduce((s, i) => s + i.balance, 0);
  const overdueCount = demoInvoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="invoices-wrap">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p>{demoInvoices.length} invoices · synthetic demo data</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="button button-secondary">Export</button>
          <button type="button" className="button button-primary">New invoice <ArrowUpRight /></button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total invoiced", value: `EGP ${formatCurrency(totalRevenue)}`, trend: "neutral" },
          { label: "Collected", value: `EGP ${formatCurrency(totalCollected)}`, trend: "up" },
          { label: "Outstanding", value: `EGP ${formatCurrency(totalOutstanding)}`, trend: "down" },
          { label: "Overdue invoices", value: String(overdueCount), trend: overdueCount > 0 ? "down" : "neutral" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span className={`kpi-value kpi-trend-${kpi.trend}`} style={{ fontSize: "1.5rem" }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input type="search" className="filter-search" placeholder="Search invoices…" aria-label="Search invoices" />
        <div className="filter-chips">
          {["All", "Paid", "Partial", "Overdue", "Draft"].map((f) => (
            <button key={f} className={`filter-chip${f === "All" ? " filter-chip-active" : ""}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table" aria-label="Invoice list">
          <thead>
            <tr>
              <th scope="col">Invoice</th>
              <th scope="col">Patient</th>
              <th scope="col">Date issued</th>
              <th scope="col">Due date</th>
              <th scope="col">Insurance</th>
              <th scope="col" style={{ textAlign: "right" }}>Subtotal</th>
              <th scope="col" style={{ textAlign: "right" }}>Tax</th>
              <th scope="col" style={{ textAlign: "right" }}>Total</th>
              <th scope="col" style={{ textAlign: "right" }}>Paid</th>
              <th scope="col" style={{ textAlign: "right" }}>Balance</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="patient-id">{inv.id}</td>
                <td>
                  <Link href={`/patients/${inv.patientId}`} className="patient-name">
                    {inv.patientName}
                  </Link>
                </td>
                <td className="numeric">{formatDate(inv.issueDate)}</td>
                <td className="numeric">{formatDate(inv.dueDate)}</td>
                <td style={{ fontSize: "0.78rem" }}>
                  {inv.insurance ? (
                    <span className="insurance-pill">{inv.insurance}</span>
                  ) : "—"}
                </td>
                <td className="numeric" style={{ textAlign: "right" }}>EGP {formatCurrency(inv.subtotal)}</td>
                <td className="numeric" style={{ textAlign: "right" }}>EGP {formatCurrency(inv.tax)}</td>
                <td className="numeric" style={{ textAlign: "right", fontWeight: 550 }}>EGP {formatCurrency(inv.total)}</td>
                <td className="numeric" style={{ textAlign: "right", color: "var(--clinic-success)" }}>EGP {formatCurrency(inv.paid)}</td>
                <td className="numeric" style={{ textAlign: "right" }}>
                  {inv.balance > 0 ? (
                    <span style={{ color: "var(--clinic-danger)", fontWeight: 550 }}>EGP {formatCurrency(inv.balance)}</span>
                  ) : "—"}
                </td>
                <td><span className={`badge badge-inv-${inv.status}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} style={{ padding: "0.85rem 1rem", fontWeight: 600, fontSize: "0.82rem", color: "var(--clinic-muted)" }}>Totals</td>
              <td />
              <td className="numeric" style={{ textAlign: "right", fontWeight: 700, padding: "0.85rem 1rem" }}>EGP {formatCurrency(totalRevenue)}</td>
              <td className="numeric" style={{ textAlign: "right", fontWeight: 700, color: "var(--clinic-success)", padding: "0.85rem 1rem" }}>EGP {formatCurrency(totalCollected)}</td>
              <td className="numeric" style={{ textAlign: "right", fontWeight: 700, color: "var(--clinic-danger)", padding: "0.85rem 1rem" }}>EGP {formatCurrency(totalOutstanding)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
