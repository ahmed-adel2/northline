export default function AppLoading() {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "50vh",
        color: "var(--clinic-muted)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Animated teal pulse ring */}
        <div style={{ position: "relative", width: "3rem", height: "3rem" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "2.5px solid var(--clinic-hairline)",
              borderTopColor: "var(--clinic-teal)",
              borderRadius: "50%",
              animation: "spinSmooth 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "0.4rem",
              border: "2px solid transparent",
              borderTopColor: "var(--clinic-teal-tint)",
              borderRadius: "50%",
              animation: "spinSmooth 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite reverse",
              opacity: 0.6,
            }}
          />
        </div>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 520,
            letterSpacing: "0.02em",
            animation: "fadeIn 0.5s ease-out forwards",
          }}
        >
          Loading portal…
        </span>
      </div>
    </div>
  );
}
