"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AnalyticsData, AnalyticsRange } from "@/lib/analytics";
import { formatCurrency } from "@/lib/demo-data";
import { ExportAnalyticsButton } from "@/components/internal/export-analytics-button";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "all", label: "All History" },
];

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedKey, setSelectedKey] = useState<string | null>(
    data.buckets.length > 0 ? data.buckets[data.buckets.length - 1].key : null,
  );

  const maxRevenue = Math.max(1, ...data.buckets.map((b) => b.revenue));
  const activeBucket =
    data.buckets.find((b) => b.key === selectedKey) ??
    data.buckets[data.buckets.length - 1] ??
    null;

  const handleRangeChange = (nextRange: AnalyticsRange) => {
    if (nextRange === data.range) return;
    startTransition(() => {
      router.push(`/analytics?range=${nextRange}`, { scroll: false });
    });
  };

  const patientTotal = Math.max(1, data.patientStats.total);

  return (
    <div className={`analytics-wrap${isPending ? " analytics-loading" : ""}`}>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Practice Performance &amp; Revenue</span>
          </div>
          <h1>Practice Analytics</h1>
          <p className="page-header-sub">
            Live Supabase metrics · {data.periodLabel}
          </p>
        </div>
        <div className="header-actions">
          <ExportAnalyticsButton
            range={data.range}
            periodLabel={data.periodLabel}
            buckets={data.buckets}
          />
        </div>
      </div>

      {/* ── Timeframe Selector ────────────────────────────── */}
      <div
        className="analytics-range-bar"
        role="tablist"
        aria-label="Analytics timeframe"
      >
        {RANGE_OPTIONS.map((opt) => {
          const isActive = data.range === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={isPending}
              onClick={() => handleRangeChange(opt.value)}
              className={`analytics-range-pill${isActive ? " is-active" : ""}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── KPI Strip ─────────────────────────────────────── */}
      <div className="kpi-grid kpi-grid-4">
        {[
          {
            label: `Total revenue (${data.periodLabel})`,
            value: `EGP ${formatCurrency(data.totalRevenue)}`,
            trend: "up" as const,
            sub: `${data.collectionRate}% collection rate`,
          },
          {
            label: "Total collected",
            value: `EGP ${formatCurrency(data.totalCollected)}`,
            trend: "up" as const,
            sub: "Cash & insurance payments",
          },
          {
            label: "Total expenses (est.)",
            value: `EGP ${formatCurrency(data.totalExpenses)}`,
            trend: "neutral" as const,
            sub: "Operating costs",
          },
          {
            label: "Net profit (est.)",
            value: `EGP ${formatCurrency(data.netProfit)}`,
            trend: data.netProfit >= 0 ? ("up" as const) : ("down" as const),
            sub: data.netProfit >= 0 ? "Profitable period" : "Deficit period",
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
      <div className="dashboard-grid dashboard-grid-3 analytics-grid">
        {/* Revenue bar chart */}
        <section className="card analytics-chart-card">
          <div className="card-header">
            <h2>Revenue vs expenses</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--clinic-muted)" }}>
              {data.periodLabel}
            </span>
          </div>

          <div className="chart-wrap">
            {data.buckets.length === 0 ? (
              <p style={{ color: "var(--clinic-muted)", fontSize: "0.875rem", padding: "2rem 0", textAlign: "center" }}>
                No invoice records found for {data.periodLabel.toLowerCase()}.
              </p>
            ) : (
              <>
                {activeBucket && (
                  <div className="chart-inspector" aria-live="polite">
                    <span className="chart-inspector-period">{activeBucket.label}</span>
                    <div className="chart-inspector-metrics">
                      <span>
                        Rev: <strong>EGP {formatCurrency(activeBucket.revenue)}</strong>
                      </span>
                      <span>
                        Col: <strong style={{ color: "var(--clinic-success)" }}>EGP {formatCurrency(activeBucket.collected)}</strong>
                      </span>
                      <span>
                        Exp: <strong>EGP {formatCurrency(activeBucket.expenses)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className="bar-chart"
                  role="img"
                  aria-label={`${data.periodLabel} revenue vs expenses bar chart`}
                >
                  {data.buckets.map((b, idx) => {
                    const isSelected = activeBucket?.key === b.key;
                    const revHeight = Math.max(4, Math.round((b.revenue / maxRevenue) * 150));
                    const expHeight = Math.max(4, Math.round((b.expenses / maxRevenue) * 150));

                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setSelectedKey(b.key)}
                        className={`bar-group${isSelected ? " is-selected" : ""}`}
                        aria-label={`${b.label}: Revenue EGP ${formatCurrency(b.revenue)}, Expenses EGP ${formatCurrency(b.expenses)}`}
                        aria-pressed={isSelected}
                      >
                        <div className="bar-pair">
                          <div
                            className="bar bar-revenue"
                            style={{
                              height: `${revHeight}px`,
                              animationDelay: `${Math.min(idx * 35, 350)}ms`,
                            }}
                          />
                          <div
                            className="bar bar-expenses"
                            style={{
                              height: `${expHeight}px`,
                              animationDelay: `${Math.min(idx * 35 + 40, 390)}ms`,
                            }}
                          />
                        </div>
                        <span className="bar-label">{b.label}</span>
                        <span className="bar-value">EGP {formatCurrency(b.revenue)}</span>
                      </button>
                    );
                  })}
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
                  <span className="legend-hint">Tap a bar for details</span>
                </div>
              </>
            )}
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
                count: data.patientStats.active,
                color: "var(--clinic-success)",
              },
              {
                label: "Overdue",
                count: data.patientStats.overdue,
                color: "var(--clinic-warning)",
              },
              {
                label: "Inactive",
                count: data.patientStats.inactive,
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
                    {seg.count} / {data.patientStats.total}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(seg.count / patientTotal) * 100}%`,
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
              {data.topProcedures.length === 0 ? (
                <p style={{ color: "var(--clinic-muted)", fontSize: "0.82rem" }}>
                  No completed appointments in {data.periodLabel.toLowerCase()}.
                </p>
              ) : (
                data.topProcedures.map((item) => (
                  <div
                    key={item.procedure}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.4rem 0",
                      borderBottom: "1px solid var(--clinic-hairline-soft)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "75%",
                      }}
                    >
                      {item.procedure}
                    </span>
                    <span className="badge badge-active">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Collection rate table */}
        <section className="card analytics-table-card">
          <div className="card-header">
            <h2>Performance breakdown</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--clinic-muted)" }}>
              {data.periodLabel} · {data.buckets.length} periods
            </span>
          </div>
          <div className="table-wrap" style={{ margin: 0, border: "none", borderRadius: 0 }}>
            <table className="data-table" aria-label="Revenue breakdown table">
              <thead>
                <tr>
                  <th scope="col">Period</th>
                  <th scope="col" style={{ textAlign: "right" }}>Revenue</th>
                  <th scope="col" style={{ textAlign: "right" }}>Collected</th>
                  <th scope="col" style={{ textAlign: "right" }}>Expenses</th>
                  <th scope="col" style={{ textAlign: "right" }}>Net profit</th>
                  <th scope="col" style={{ textAlign: "right" }}>Collection rate</th>
                </tr>
              </thead>
              <tbody>
                {data.buckets.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--clinic-muted)", padding: "1.5rem" }}>
                      No data available for {data.periodLabel.toLowerCase()}.
                    </td>
                  </tr>
                ) : (
                  data.buckets.map((b) => {
                    const net = b.collected - b.expenses;
                    const rate = b.revenue > 0 ? Math.round((b.collected / b.revenue) * 100) : 0;
                    return (
                      <tr key={b.key}>
                        <td style={{ fontWeight: 600 }}>{b.label}</td>
                        <td className="numeric" style={{ textAlign: "right" }}>
                          EGP {formatCurrency(b.revenue)}
                        </td>
                        <td
                          className="numeric"
                          style={{ textAlign: "right", color: "var(--clinic-success)" }}
                        >
                          EGP {formatCurrency(b.collected)}
                        </td>
                        <td
                          className="numeric"
                          style={{ textAlign: "right", color: "var(--clinic-muted)" }}
                        >
                          EGP {formatCurrency(b.expenses)}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
