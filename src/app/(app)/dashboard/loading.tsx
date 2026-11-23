export default function DashboardLoading() {
  return (
    <div className="m-stack" style={{ gap: "1.25rem" }}>
      {/* Header skeleton */}
      <div className="page-header">
        <div>
          <div className="skeleton" style={{ width: "12rem", height: "1.75rem", marginBottom: "0.5rem" }} />
          <div className="skeleton" style={{ width: "8rem", height: "0.9rem" }} />
        </div>
        <div className="skeleton" style={{ width: "10rem", height: "2.4rem", borderRadius: "var(--clinic-radius-sm)" }} />
      </div>

      {/* KPI skeleton grid */}
      <div className="kpi-grid kpi-grid-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kpi-card" style={{ padding: "1.25rem" }}>
            <div className="skeleton" style={{ width: "6rem", height: "0.65rem", marginBottom: "0.65rem" }} />
            <div className="skeleton" style={{ width: "4rem", height: "1.5rem" }} />
          </div>
        ))}
      </div>

      {/* Content card skeleton */}
      <div className="card" style={{ padding: "1rem" }}>
        <div className="skeleton" style={{ width: "10rem", height: "1rem", marginBottom: "1rem" }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 0",
              borderBottom: "1px solid var(--clinic-hairline)",
            }}
          >
            <div className="skeleton" style={{ width: "4rem", height: "0.85rem" }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "60%", height: "0.85rem", marginBottom: "0.35rem" }} />
              <div className="skeleton" style={{ width: "40%", height: "0.7rem" }} />
            </div>
            <div className="skeleton" style={{ width: "4.5rem", height: "1.4rem", borderRadius: "999px" }} />
          </div>
        ))}
      </div>

      {/* Second card skeleton */}
      <div className="card" style={{ padding: "1rem" }}>
        <div className="skeleton" style={{ width: "8rem", height: "1rem", marginBottom: "1rem" }} />
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 0",
              borderBottom: i < 1 ? "1px solid var(--clinic-hairline)" : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "55%", height: "0.85rem", marginBottom: "0.35rem" }} />
              <div className="skeleton" style={{ width: "35%", height: "0.7rem" }} />
            </div>
            <div className="skeleton" style={{ width: "3.5rem", height: "1.4rem", borderRadius: "999px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
