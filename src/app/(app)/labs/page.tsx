import "@/app/(app)/internal.css";
import { demoLabOrders, formatDate, formatCurrency } from "@/lib/demo-data";
import Link from "next/link";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statusOrder = ["sent", "in-production", "shipped", "received", "delivered", "rejected"];

export default function Labs() {
  const inProgress = demoLabOrders.filter((l) => !["delivered", "rejected"].includes(l.status));
  const completed = demoLabOrders.filter((l) => ["delivered", "rejected"].includes(l.status));

  return (
    <div className="labs-wrap">
      <div className="page-header">
        <div>
          <h1>Lab Orders</h1>
          <p>{demoLabOrders.length} orders · {inProgress.length} active · synthetic demo data</p>
        </div>
        <button type="button" className="button button-primary">
          New lab order <ArrowUpRight />
        </button>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total orders", value: String(demoLabOrders.length) },
          { label: "In production", value: String(demoLabOrders.filter((l) => l.status === "in-production").length) },
          { label: "Received / awaiting delivery", value: String(demoLabOrders.filter((l) => l.status === "received").length) },
          { label: "Total lab spend", value: `EGP ${formatCurrency(demoLabOrders.reduce((s, l) => s + l.cost, 0))}` },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value" style={{ fontSize: "1.5rem" }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table" aria-label="Lab orders">
          <thead>
            <tr>
              <th scope="col">Order ID</th>
              <th scope="col">Patient</th>
              <th scope="col">Lab</th>
              <th scope="col">Work type</th>
              <th scope="col">Tooth</th>
              <th scope="col">Sent</th>
              <th scope="col">Expected</th>
              <th scope="col" style={{ textAlign: "right" }}>Cost</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoLabOrders.map((order) => (
              <tr key={order.id}>
                <td className="patient-id">{order.id}</td>
                <td>
                  <Link href={`/patients/${order.patientId}`} className="patient-name">
                    {order.patientName}
                  </Link>
                </td>
                <td style={{ fontSize: "0.82rem" }}>{order.labName}</td>
                <td style={{ fontWeight: 550, fontSize: "0.85rem" }}>{order.workType}</td>
                <td className="numeric">{order.tooth}</td>
                <td className="numeric">{formatDate(order.sentDate)}</td>
                <td className="numeric">{formatDate(order.expectedDate)}</td>
                <td className="numeric" style={{ textAlign: "right" }}>EGP {formatCurrency(order.cost)}</td>
                <td><span className={`badge badge-lab-${order.status.replace(/-/g, "")}`}>{order.status.replace(/-/g, " ")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline view */}
      <section className="card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header"><h2>Active orders — lifecycle view</h2></div>
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {inProgress.map((order) => {
            const currentStep = statusOrder.indexOf(order.status);
            return (
              <div key={order.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 550 }}>{order.patientName} — {order.workType} ({order.tooth})</span>
                  <span style={{ color: "var(--clinic-muted)", fontSize: "0.78rem" }}>{order.labName}</span>
                </div>
                <div className="lab-lifecycle">
                  {statusOrder.slice(0, 5).map((step, i) => (
                    <div key={step} className={`lifecycle-step${i <= currentStep ? " lifecycle-done" : ""}${i === currentStep ? " lifecycle-current" : ""}`}>
                      <div className="lifecycle-dot" />
                      <span className="lifecycle-label">{step.replace(/-/g, " ")}</span>
                      {i < 4 && <div className={`lifecycle-line${i < currentStep ? " lifecycle-line-done" : ""}`} />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
