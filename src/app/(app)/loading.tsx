export default function AppLoading() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "50vh", color: "var(--clinic-muted)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "2rem", height: "2rem", border: "2px solid var(--clinic-hairline)", borderTopColor: "var(--clinic-teal)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "0.85rem" }}>Loading portal…</span>
      </div>
    </div>
  );
}
