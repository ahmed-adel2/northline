export default function Loading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div className="skeleton" style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%" }} />
        <span style={{ color: "var(--clinic-muted)", fontSize: "0.85rem" }}>Loading…</span>
      </div>
    </div>
  );
}
