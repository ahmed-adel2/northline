import Link from "next/link";
import "@/app/(app)/internal.css";
import {
  demoAppointments,
  demoInvoices,
  demoTasks,
  demoPatients,
  formatCurrency,
  TODAY,
} from "@/lib/demo-data";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendUp() {
  return (
    <svg className="trend-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrendDown() {
  return (
    <svg className="trend-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4l4 4 3-3 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const todayAppts = demoAppointments.filter((a) => a.date === TODAY);
  const checkedIn = todayAppts.filter((a) => a.status === "checked-in" || a.status === "in-progress").length;
  const todayRevenue = demoInvoices.reduce((sum, inv) => {
    if (inv.issueDate === TODAY) return sum + inv.paid;
    return sum;
  }, 0);
  const pendingClaims = demoInvoices.filter((inv) => inv.insuranceClaim && inv.status !== "paid").length;
  const openTasks = demoTasks.filter((t) => t.status === "open").length;
  const overduePatients = demoPatients.filter((p) => p.status === "overdue").length;
  const outstanding = demoInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const kpis = [
    { label: "Today's appointments", value: String(todayAppts.length), delta: "+2 vs yesterday", trend: "up" as const, href: "/calendar" },
    { label: "Checked in", value: String(checkedIn), delta: `${todayAppts.length - checkedIn} remaining`, trend: "neutral" as const, href: "/calendar" },
    { label: "Revenue today", value: `EGP ${formatCurrency(todayRevenue)}`, delta: "+5.2% vs last week", trend: "up" as const, href: "/analytics" },
    { label: "Outstanding balance", value: `EGP ${formatCurrency(outstanding)}`, delta: `${overduePatients} overdue patients`, trend: "down" as const, href: "/invoices" },
    { label: "Open tasks", value: String(openTasks), delta: "2 high priority", trend: "down" as const, href: "/tasks" },
    { label: "Pending claims", value: String(pendingClaims), delta: "1 requires attention", trend: "neutral" as const, href: "/insurance" },
  ];

  return (
    <div className="dashboard-wrap">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Northline Dental Clinic — Saturday, 22 November 2026.{" "}
            <span className="demo-flag">Demo data · synthetic records</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/patients" className="button button-secondary">
            New patient <ArrowUpRight />
          </Link>
          <Link href="/calendar" className="button button-primary">
            New appointment <ArrowUpRight />
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid kpi-grid-6">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="kpi-card kpi-card-link">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value}</span>
            <span className={`kpi-delta kpi-trend-${kpi.trend}`}>
              {kpi.trend === "up" ? <TrendUp /> : kpi.trend === "down" ? <TrendDown /> : null}
              {kpi.delta}
            </span>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="dashboard-grid dashboard-grid-3">
        {/* Today's schedule */}
        <section className="schedule-card card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <h2>Today&apos;s schedule</h2>
            <Link href="/calendar" className="button-link">
              Full calendar <ArrowUpRight />
            </Link>
          </div>
          <div className="schedule-list">
            {todayAppts.length === 0 ? (
              <p className="empty-state-text">No appointments scheduled today.</p>
            ) : (
              todayAppts.map((appt) => (
                <article key={appt.id} className="appointment-row">
                  <span className="appt-time">{appt.startTime}</span>
                  <div className="appt-info">
                    <Link href={`/patients/${appt.patientId}`} className="appt-patient-link">
                      {appt.patientName}
                    </Link>
                    <span className="appt-procedure">{appt.procedure}</span>
                  </div>
                  <span className="appt-doctor">{appt.doctorName.replace("Dr. ", "")}</span>
                  <span className={`appt-status appt-${appt.status.replace("-", "")}`}>
                    {appt.status.replace(/-/g, " ")}
                  </span>
                  <span className="appt-room">Room {appt.room}</span>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="card">
          <div className="card-header">
            <h2>Quick actions</h2>
          </div>
          <div className="action-grid" style={{ padding: "1rem 1.25rem 1.25rem" }}>
            <Link href="/patients" className="action-button">
              <span className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /><line x1="20" y1="8" x2="20" y2="14" />
                </svg>
              </span>
              <span>New patient</span>
            </Link>
            <Link href="/calendar" className="action-button">
              <span className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
                </svg>
              </span>
              <span>Book appointment</span>
            </Link>
            <Link href="/invoices" className="action-button">
              <span className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </span>
              <span>New invoice</span>
            </Link>
            <Link href="/treatment-plans" className="action-button">
              <span className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <path d="M12 2C8 2 5 5 5 9c0 2.5 1 4.5 2.5 6L9 21h6l1.5-6C18 13.5 19 11.5 19 9c0-4-3-7-7-7z" />
                </svg>
              </span>
              <span>Treatment plan</span>
            </Link>
            <Link href="/tasks" className="action-button">
              <span className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
              <span>Add task</span>
            </Link>
            <Link href="/qr" className="action-button">
              <span className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3z" /><path d="M17 17h4v4h-4z" />
                </svg>
              </span>
              <span>QR check-in</span>
            </Link>
          </div>
        </section>

        {/* Open tasks */}
        <section className="card">
          <div className="card-header">
            <h2>Open tasks</h2>
            <Link href="/tasks" className="button-link">
              All tasks <ArrowUpRight />
            </Link>
          </div>
          <ul className="task-preview-list">
            {demoTasks
              .filter((t) => t.status === "open")
              .slice(0, 5)
              .map((task) => (
                <li key={task.id} className="task-preview-item">
                  <span className={`task-priority-dot priority-${task.priority}`} aria-label={`${task.priority} priority`} />
                  <div className="task-preview-info">
                    <span className="task-preview-title">{task.title}</span>
                    <span className="task-preview-meta">
                      {task.type} · Due {task.due}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </section>

        {/* Recent invoices */}
        <section className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <h2>Recent invoices</h2>
            <Link href="/invoices" className="button-link">
              All invoices <ArrowUpRight />
            </Link>
          </div>
          <div className="table-wrap" style={{ margin: 0, border: "none", borderRadius: 0 }}>
            <table className="data-table" aria-label="Recent invoices">
              <thead>
                <tr>
                  <th scope="col">Invoice</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Date</th>
                  <th scope="col" style={{ textAlign: "right" }}>Total</th>
                  <th scope="col" style={{ textAlign: "right" }}>Balance</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {demoInvoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id}>
                    <td className="patient-id">{inv.id}</td>
                    <td>
                      <Link href={`/patients/${inv.patientId}`} className="patient-name">
                        {inv.patientName}
                      </Link>
                    </td>
                    <td className="numeric">{inv.issueDate}</td>
                    <td className="numeric" style={{ textAlign: "right" }}>
                      EGP {formatCurrency(inv.total)}
                    </td>
                    <td className="numeric" style={{ textAlign: "right" }}>
                      {inv.balance > 0 ? (
                        <span style={{ color: "var(--clinic-danger)" }}>
                          EGP {formatCurrency(inv.balance)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-inv-${inv.status}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
