import { demoMonthlyRevenue, demoAppointments, demoPatients, formatCurrency } from "@/lib/demo-data";
import { ExportAnalyticsButton } from "@/components/internal/export-analytics-button";

export const metadata = { title: "Financial & Practice Analytics — Northline Dental Clinic" };

export default function Analytics() {
  const totalRevenue = demoMonthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalCollected = demoMonthlyRevenue.reduce((s, m) => s + m.collected, 0);
  const totalExpenses = demoMonthlyRevenue.reduce((s, m) => s + m.expenses, 0);
  const maxRevenue = Math.max(...demoMonthlyRevenue.map((m) => m.revenue));

  const procedureCounts: Record<string, number> = {};
  demoAppointments
    .filter((a) => a.status === "completed")
    .forEach((a) => {
      procedureCounts[a.procedure] = (procedureCounts[a.procedure] ?? 0) + 1;
    });
  const topProcedures = Object.entries(procedureCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const netProfit = totalCollected - totalExpenses;
  const collectionRate = totalRevenue > 0
    ? Math.round((totalCollected / totalRevenue) * 100)
    : 0;

  return (
    <div className="analytics-wrap">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Practice Performance &amp; Revenue</span>
          </div>
          <h1>Practice Analytics</h1>
          <p className="page-header-sub">
            Revenue growth, treatment case distribution, and monthly clinic collections
          </p>
        </div>
        <div className="header-actions">
          <ExportAnalyticsButton />
        </div>
      </div>

      {/* ── KPI Strip ─────────────────────────────────────── */}
      <div className="kpi-grid kpi-grid-4">
        {[
          {
            label: "Total revenue (7 mo.)",
            value: `EGP ${formatCurrency(totalRevenue)}`,
            trend: "up" as const,
            sub: `${collectionRate}% collection rate`,
          },
          {
            label: "Total collected",
            value: `EGP ${formatCurrency(totalCollected)}`,
            trend: "up" as const,
            sub: "Cash & insurance payments",
          },
          {
            label: "Total expenses",
            value: `EGP ${formatCurrency(totalExpenses)}`,
            trend: "neutral" as const,
            sub: "Operating costs",
          },
          {
            label: "Net profit (est.)",
            value: `EGP ${formatCurrency(netProfit)}`,
            trend: netProfit >= 0 ? ("up" as const) : ("down" as const),
            sub: netProfit >= 0 ? "Profitable period" : "Deficit period",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span
              className={`kpi-value kpi-trend-${kpi.trend}`}
              style={{ fontSize: "1.4rem" }}
            >
              {kpi.value}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--clinic-muted)",
                marginTop: "0.15rem",
              }}
            >
              {kpi.sub}
            </span>
          </div>
        ))}
      </div>

      {/* ── Charts Grid ───────────────────────────────────── */}
      <div className="dashboard-grid dashboard-grid-3">
        {/* Revenue bar chart */}
        <section className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <h2>Monthly revenue vs expenses</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--clinic-muted)" }}>
              May – Nov 2026
            </span>
          </div>
          <div className="chart-wrap">
            <div
              className="bar-chart"
              role="img"
              aria-label="Monthly revenue vs expenses bar chart"
            >
              {demoMonthlyRevenue.map((m) => (
                <div key={m.month} className="bar-group">
                  <div className="bar-pair">
                    <div
                      className="bar bar-revenue"
                      style={{ height: `${(m.revenue / maxRevenue) * 160}px` }}
                      title={`Revenue: EGP ${formatCurrency(m.revenue)}`}
                      role="img"
                      aria-label={`${m.month} revenue: EGP ${formatCurrency(m.revenue)}`}
                    />
                    <div
                      className="bar bar-expenses"
                      style={{ height: `${(m.expenses / maxRevenue) * 160}px` }}
                      title={`Expenses: EGP ${formatCurrency(m.expenses)}`}
                      role="img"
                      aria-label={`${m.month} expenses: EGP ${formatCurrency(m.expenses)}`}
                    />
                  </div>
                  <span className="bar-label">{m.month}</span>
                  <span className="bar-value">EGP {formatCurrency(m.revenue)}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "var(--clinic-teal)" }} />
                Revenue
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: "var(--clinic-hairline)" }} />
                Expenses
              </span>
            </div>
          </div>
        </section>

        {/* Patient stats + top procedures */}
        <section className="card">
          <div className="card-header">
            <h2>Patient breakdown</h2>
          </div>
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              {
                label: "Active",
                count: demoPatients.filter((p) => p.status === "active").length,
                color: "var(--clinic-success)",
              },
              {
                label: "Overdue",
                count: demoPatients.filter((p) => p.status === "overdue").length,
                color: "var(--clinic-warning)",
              },
              {
                label: "Inactive",
                count: demoPatients.filter((p) => p.status === "inactive").length,
                color: "var(--clinic-muted)",
              },
            ].map((seg) => (
              <div key={seg.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.35rem",
                    fontSize: "0.82rem",
                  }}
                >
                  <span style={{ color: "var(--clinic-muted)", fontWeight: 600 }}>
                    {seg.label}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                    {seg.count} / {demoPatients.length}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(seg.count / demoPatients.length) * 100}%`,
                      background: seg.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Top procedures */}
            <div
              style={{
                borderTop: "1px solid var(--clinic-hairline)",
                paddingTop: "1rem",
                marginTop: "0.5rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--clinic-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Top procedures (completed)
              </h3>
              {topProcedures.length === 0 ? (
                <p style={{ color: "var(--clinic-muted)", fontSize: "0.82rem" }}>
                  No completed appointments in demo data.
                </p>
              ) : (
                topProcedures.map(([proc, cnt]) => (
                  <div
                    key={proc}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.4rem 0",
                      borderBottom: "1px solid var(--clinic-hairline-soft)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>
                      {proc}
                    </span>
                    <span className="badge badge-active">{cnt}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Collection rate table */}
        <section className="card" style={{ gridColumn: "span 3" }}>
          <div className="card-header">
            <h2>Monthly performance table</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--clinic-muted)" }}>
              Detailed breakdown · May – Nov 2026
            </span>
          </div>
          <div className="table-wrap" style={{ margin: 0, border: "none", borderRadius: 0 }}>
            <table className="data-table" aria-label="Monthly revenue breakdown">
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col" style={{ textAlign: "right" }}>Revenue</th>
                  <th scope="col" style={{ textAlign: "right" }}>Collected</th>
                  <th scope="col" style={{ textAlign: "right" }}>Expenses</th>
                  <th scope="col" style={{ textAlign: "right" }}>Net profit</th>
                  <th scope="col" style={{ textAlign: "right" }}>Collection rate</th>
                </tr>
              </thead>
              <tbody>
                {demoMonthlyRevenue.map((m) => {
                  const net = m.collected - m.expenses;
                  const rate = Math.round((m.collected / m.revenue) * 100);
                  return (
                    <tr key={m.month}>
                      <td style={{ fontWeight: 600 }}>{m.month} 2026</td>
                      <td className="numeric" style={{ textAlign: "right" }}>
                        EGP {formatCurrency(m.revenue)}
                      </td>
                      <td
                        className="numeric"
                        style={{ textAlign: "right", color: "var(--clinic-success)" }}
                      >
                        EGP {formatCurrency(m.collected)}
                      </td>
                      <td
                        className="numeric"
                        style={{ textAlign: "right", color: "var(--clinic-muted)" }}
                      >
                        EGP {formatCurrency(m.expenses)}
                      </td>
                      <td
                        className="numeric"
                        style={{
                          textAlign: "right",
                          color: net >= 0 ? "var(--clinic-success)" : "var(--clinic-danger)",
                          fontWeight: 700,
                        }}
                      >
                        EGP {formatCurrency(net)}
                      </td>
                      <td className="numeric" style={{ textAlign: "right" }}>
                        <span
                          className={`badge${
                            rate >= 90
                              ? " badge-active"
                              : rate >= 75
                              ? " badge-inv-partial"
                              : " badge-overdue"
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
