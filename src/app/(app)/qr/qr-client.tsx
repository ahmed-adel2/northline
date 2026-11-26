"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { generateQrMatrix, qrSvgPath } from "@/lib/qr";
import { addArrivalAsPatient } from "./actions";

export type ArrivalItem = {
  id: string;
  memberName: string;
  email: string | null;
  username: string | null;
  phone: string | null;
  arrivedAtIso: string;
  isNew: boolean;
  matchedPatientCode: string | null;
};

const ARRIVAL_TIME_ZONE = "Africa/Cairo";

function arrivalDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: ARRIVAL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function groupArrivalsByDate(arrivals: ArrivalItem[]) {
  const groups = new Map<string, ArrivalItem[]>();
  for (const arrival of arrivals) {
    const key = arrivalDateKey(new Date(arrival.arrivedAtIso));
    groups.set(key, [...(groups.get(key) ?? []), arrival]);
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: ARRIVAL_TIME_ZONE,
    dateStyle: "full",
  });
  return Array.from(groups, ([dateKey, items]) => ({
    dateKey,
    dateLabel: dateLabel.format(new Date(items[0].arrivedAtIso)),
    items,
  }));
}

const emptySubscribe = () => () => {};

function useOrigin() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => "https://northline.clinic"
  );
}

function QrSvg({
  value,
  size,
  id,
  ariaLabel,
}: {
  value: string;
  size: number;
  id?: string;
  ariaLabel: string;
}) {
  const { viewBoxSize, path } = useMemo(
    () => qrSvgPath(generateQrMatrix(value)),
    [value]
  );

  return (
    <svg
      id={id}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      aria-label={ariaLabel}
      shapeRendering="crispEdges"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
      <path d={path} fill="#132a2c" />
    </svg>
  );
}

export function QrClient({
  arrivals,
}: {
  arrivals: ArrivalItem[];
}) {
  const router = useRouter();
  const origin = useOrigin();
  const [copied, setCopied] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkinUrl = `${origin}/checkin`;
  const arrivalGroups = useMemo(() => groupArrivalsByDate(arrivals), [arrivals]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadClinicQR = (filename: string) => {
    const svgEl = document.getElementById("clinic-qr-svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddMember = async (arrival: ArrivalItem) => {
    setErrorMsg(null);
    setAddingId(arrival.id);
    try {
      const res = await addArrivalAsPatient(arrival.id);
      if (res.ok) {
        router.refresh();
        return;
      }
      if ("needsPhone" in res && res.needsPhone) {
        const params = new URLSearchParams();
        params.set("name", arrival.memberName);
        if (arrival.email) params.set("email", arrival.email);
        if (arrival.phone) params.set("phone", arrival.phone);
        router.push(`/patients/new?${params.toString()}`);
        return;
      }
      if ("error" in res && res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="qr-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Contactless Reception</span>
          </div>
          <h1>QR Access &amp; Check-in</h1>
          <p className="page-header-sub">
            Generate clinic reception kiosks, track Clerk patient arrivals, and manage self-check-in passes
          </p>
        </div>
      </div>

      {/* Clinic-wide QR */}
      <section className="card qr-section">
        <div className="card-header">
          <h2>Clinic check-in QR poster</h2>
        </div>
        <div className="qr-clinic-body" style={{ flexWrap: "wrap" }}>
          <div className="qr-code-block">
            <div className="qr-placeholder" aria-label="QR code for clinic check-in">
              <QrSvg
                id="clinic-qr-svg"
                value={checkinUrl}
                size={136}
                ariaLabel="Scannable QR code for Northline Dental Clinic check-in"
              />
            </div>
            <span className="qr-label">/checkin</span>
          </div>
          <div className="qr-clinic-info" style={{ flex: 1, minWidth: "260px" }}>
            <h3>Northline Dental Clinic — Main Branch Kiosk</h3>
            <p>
              Patients scan this code at reception to sign in or sign up with Clerk and register their arrival automatically.
            </p>
            <div className="qr-url-row">
              <code className="qr-url">{checkinUrl}</code>
              <button className="button button-secondary" type="button" onClick={handleCopyLink}>
                {copied ? "✓ Copied to clipboard!" : "Copy link"}
              </button>
            </div>
            <div className="header-actions" style={{ marginTop: "1rem" }}>
              <button
                className="button button-primary"
                type="button"
                onClick={() => downloadClinicQR("Northline-Clinic-Checkin-QR.svg")}
              >
                Download SVG
              </button>
              <button className="button button-secondary" type="button" onClick={() => window.print()}>
                Print Reception Poster
              </button>
              <Link href="/checkin" className="button button-secondary" target="_blank" rel="noopener noreferrer">
                Open Check-in Page ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Arrivals Section */}
      <section className="card qr-section" style={{ marginTop: "1.5rem" }}>
        <div
          className="card-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}
        >
          <div>
            <h2>Arrivals ({arrivals.length})</h2>
            <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)" }}>
              Patients who scanned the QR code and signed in or signed up via Clerk.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <a
              href="/api/qr/arrivals/export"
              className="button button-secondary"
              aria-label="Download complete arrivals history as a CSV file"
              style={{ fontSize: "0.78rem", minHeight: "34px", padding: "0.3rem 0.75rem" }}
            >
              Arrivals history
            </a>
            <button
              type="button"
              className="button button-secondary"
              style={{ fontSize: "0.78rem", minHeight: "34px", padding: "0.3rem 0.75rem" }}
              onClick={() => router.refresh()}
            >
              Refresh
            </button>
          </div>
        </div>

        {errorMsg && (
          <p className="m-error" role="alert" style={{ marginBottom: "0.75rem" }}>
            {errorMsg}
          </p>
        )}

        {arrivals.length === 0 ? (
          <div className="m-empty-compact" style={{ padding: "1.5rem 0.5rem" }}>
            <span>No arrivals recorded yet. When a patient scans the QR code and signs in, they will appear here.</span>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.25rem", margin: "0.25rem 0.5rem 0.5rem" }}>
            {arrivalGroups.map((group) => (
              <section key={group.dateKey} aria-labelledby={`arrivals-${group.dateKey}`}>
                <h3
                  id={`arrivals-${group.dateKey}`}
                  style={{ margin: "0 0 0.65rem", fontSize: "0.9rem", color: "var(--clinic-ink)" }}
                >
                  {group.dateLabel} <span style={{ color: "var(--clinic-muted)", fontWeight: 500 }}>({group.items.length})</span>
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "0.9rem",
                  }}
                >
                  {group.items.map((a) => {
                    const arrived = new Date(a.arrivedAtIso);
                    const timeStr = arrived.toLocaleTimeString("en-US", {
                      timeZone: ARRIVAL_TIME_ZONE,
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    return (
                    <div
                      key={a.id}
                      style={{
                        border: "1px solid var(--clinic-hairline)",
                        borderRadius: "var(--clinic-radius-sm)",
                        background: "var(--clinic-ground)",
                        padding: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "0.95rem", color: "var(--clinic-ink)" }}>
                            {a.memberName}
                          </strong>
                          {a.isNew && (
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                padding: "0.12rem 0.45rem",
                                borderRadius: "999px",
                                background: "#fef3c7",
                                color: "#92400e",
                                border: "1px solid #fcd34d",
                              }}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        {a.matchedPatientCode && (
                          <Link
                            href={`/patients/${a.matchedPatientCode}`}
                            className="button-link"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {a.matchedPatientCode}
                          </Link>
                        )}
                      </div>
    
                      <div style={{ fontSize: "0.8rem", color: "var(--clinic-muted)", display: "grid", gap: "0.2rem" }}>
                        <div>
                          <strong style={{ color: "var(--clinic-ink)", fontWeight: 550 }}>Email:</strong>{" "}
                          {a.email ?? "—"}
                        </div>
                        <div>
                          <strong style={{ color: "var(--clinic-ink)", fontWeight: 550 }}>Username:</strong>{" "}
                          {a.username ?? "—"}
                        </div>
                        <div>
                          <strong style={{ color: "var(--clinic-ink)", fontWeight: 550 }}>Arrived:</strong>{" "}
                          {timeStr}
                        </div>
                      </div>
    
                      {a.isNew && (
                        <div style={{ marginTop: "0.35rem" }}>
                          <button
                            type="button"
                            className="button button-primary"
                            disabled={addingId === a.id}
                            onClick={() => handleAddMember(a)}
                            style={{ fontSize: "0.76rem", padding: "0.35rem 0.75rem", minHeight: "32px" }}
                          >
                            {addingId === a.id ? "Adding…" : "Add the member"}
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
