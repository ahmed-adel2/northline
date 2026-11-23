"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { saveToothCondition } from "./actions";
import { ToothFinding } from "@/db";

type ToothCondition = "healthy" | "filled" | "missing" | "crown" | "rct" | "implant" | "decay";

const statusColors: Record<ToothCondition, { bg: string; border: string; text: string; dot: string }> = {
  healthy: { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e" },
  filled: { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", dot: "#3b82f6" },
  missing: { bg: "#f3f4f6", border: "#d1d5db", text: "#6b7280", dot: "#9ca3af" },
  crown: { bg: "#fefce8", border: "#fde047", text: "#854d0e", dot: "#eab308" },
  rct: { bg: "#fff1f2", border: "#fda4af", text: "#9f1239", dot: "#f43f5e" },
  implant: { bg: "#f0fdfa", border: "#5eead4", text: "#115e59", dot: "#14b8a6" },
  decay: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", dot: "#ef4444" },
};

const statusLabels: Record<ToothCondition, string> = {
  healthy: "Healthy",
  filled: "Filled",
  missing: "Missing",
  crown: "Crown",
  rct: "Root Canal (RCT)",
  implant: "Dental Implant",
  decay: "Caries / Decay",
};

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

function ToothAnatomyIcon({ status }: { status: ToothCondition }) {
  return (
    <svg viewBox="0 0 32 40" className="tooth-svg" fill="none" aria-hidden="true">
      <path
        d="M6 14C6 8 8 4 16 4C24 4 26 8 26 14C26 18 24 21 21 24C19 26 18 30 18 36H14C14 30 13 26 11 24C8 21 6 18 6 14Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 12C14 14 18 14 20 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
      <path d="M16 8V16" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
      {status === "missing" && (
        <line x1="8" y1="8" x2="24" y2="32" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      )}
      {status === "crown" && (
        <path d="M8 7L16 11L24 7V13H8V7Z" fill="currentColor" opacity="0.3" />
      )}
      {status === "rct" && (
        <path d="M15 18L16 34M17 18L16 34" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="2 2" />
      )}
      {status === "implant" && (
        <g stroke="currentColor" strokeWidth="1.25">
          <line x1="13" y1="28" x2="19" y2="28" />
          <line x1="13" y1="31" x2="19" y2="31" />
          <line x1="14" y1="34" x2="18" y2="34" />
        </g>
      )}
    </svg>
  );
}

export interface PatientItem {
  id: string;
  patientNo: number;
  fullName: string;
  phone: string;
}

export function ClinicalClient({
  patients,
  initialFindings,
}: {
  patients: PatientItem[];
  initialFindings: ToothFinding[];
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || "P-003"
  );
  const [patientSearch, setPatientSearch] = useState("");
  const [activeTooth, setActiveTooth] = useState<number>(16);
  const [findings, setFindings] = useState<ToothFinding[]>(initialFindings);
  const [saving, setSaving] = useState(false);

  const selectedPatientData = patients.find(
    (p) => p.id === selectedPatientId || `P-${String(p.patientNo).padStart(3, "0")}` === selectedPatientId
  );

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const code = `P-${String(p.patientNo).padStart(3, "0")}`;
      return (
        p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
        code.toLowerCase().includes(patientSearch.toLowerCase())
      );
    });
  }, [patients, patientSearch]);

  const patientCodeStr = selectedPatientData
    ? `P-${String(selectedPatientData.patientNo).padStart(3, "0")}`
    : selectedPatientId;

  // Active tooth finding
  const activeFinding = findings.find(
    (f) =>
      (f.patientId === selectedPatientId || f.patientId === patientCodeStr) &&
      f.tooth === activeTooth
  );
  const currentStatus: ToothCondition = (activeFinding?.status as ToothCondition) || "healthy";

  const getToothStatus = (tooth: number): ToothCondition => {
    const f = findings.find(
      (item) =>
        (item.patientId === selectedPatientId || item.patientId === patientCodeStr) &&
        item.tooth === tooth
    );
    return (f?.status as ToothCondition) || "healthy";
  };

  const handleSetCondition = async (status: ToothCondition) => {
    setSaving(true);
    setFindings((prev) => {
      const filtered = prev.filter(
        (f) =>
          !(
            (f.patientId === selectedPatientId || f.patientId === patientCodeStr) &&
            f.tooth === activeTooth
          )
      );
      return [
        ...filtered,
        {
          id: `temp-${Date.now()}`,
          patientId: patientCodeStr,
          tooth: activeTooth,
          status,
          notes: `Updated on ${new Date().toLocaleDateString()}`,
          isDemo: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    try {
      await saveToothCondition(patientCodeStr, activeTooth, status);
    } catch (err) {
      alert("Failed to save tooth condition: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="clinical-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>FDI World Dental Federation Notation</span>
          </div>
          <h1>Odontogram &amp; Tooth Chart</h1>
          <p className="page-header-sub">Interactive anatomical charting, diagnostics, and findings synced to Supabase</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-secondary" onClick={() => window.print()}>
            <span>Print chart</span>
          </button>
          <Link href="/treatment-plans" className="button button-primary">
            <span>View treatment plans</span>
          </Link>
        </div>
      </div>

      <div className="clinical-grid">
        {/* Patient Selection Sidebar */}
        <aside className="card clinical-sidebar">
          <div className="sidebar-patient-search">
            <input
              type="text"
              placeholder="Search patients..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="sidebar-filter-input"
            />
          </div>
          <ul className="patient-selector-list">
            {filteredPatients.map((p) => {
              const code = `P-${String(p.patientNo).padStart(3, "0")}`;
              const isSelected = p.id === selectedPatientId || code === selectedPatientId;
              const initials = p.fullName.slice(0, 2).toUpperCase();
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`patient-selector-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedPatientId(code)}
                  >
                    <div className="patient-avatar-mini">{initials}</div>
                    <div className="patient-btn-content">
                      <span className="patient-selector-name">{p.fullName}</span>
                      <span className="patient-selector-meta">{code} · {p.phone}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Clinical Main Content */}
        <section className="clinical-main" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Patient Banner */}
          <div className="clinical-patient-banner">
            <div className="banner-left">
              <span className="banner-patient-code">{patientCodeStr}</span>
              <div>
                <span className="banner-patient-name">{selectedPatientData?.fullName || "Selected Patient"}</span>
                <div className="banner-patient-sub">Permanent Adult Dentition · FDI 2-digit System</div>
              </div>
            </div>
            <span className="no-allergy-pill">Chart Active &amp; Synced</span>
          </div>

          {/* Anatomical Odontogram Chart */}
          <div className="card chart-container">
            <div className="chart-top-bar">
              <span className="chart-section-title">Anatomical Tooth Chart</span>
              <span className="chart-arch-indicator">Click tooth to inspect &amp; record diagnostics</span>
            </div>

            {/* Upper Jaw Quadrants */}
            <div className="quadrant-header-row">
              <span className="quadrant-badge">Q1 · Maxillary Right</span>
              <span className="quadrant-badge">Q2 · Maxillary Left</span>
            </div>

            <div className="tooth-row">
              {UPPER_RIGHT.map((tooth) => {
                const st = getToothStatus(tooth);
                const isAct = activeTooth === tooth;
                const colors = statusColors[st];
                return (
                  <button
                    type="button"
                    key={tooth}
                    className={`tooth-cell ${isAct ? "tooth-cell-active" : ""}`}
                    style={{ background: colors.bg, borderColor: isAct ? "var(--clinic-teal)" : colors.border }}
                    onClick={() => setActiveTooth(tooth)}
                  >
                    <span className="tooth-num" style={{ color: colors.text }}>{tooth}</span>
                    <ToothAnatomyIcon status={st} />
                    <span className="tooth-status-pill" style={{ color: colors.text }}>{st}</span>
                  </button>
                );
              })}

              <div className="midline-divider" />

              {UPPER_LEFT.map((tooth) => {
                const st = getToothStatus(tooth);
                const isAct = activeTooth === tooth;
                const colors = statusColors[st];
                return (
                  <button
                    type="button"
                    key={tooth}
                    className={`tooth-cell ${isAct ? "tooth-cell-active" : ""}`}
                    style={{ background: colors.bg, borderColor: isAct ? "var(--clinic-teal)" : colors.border }}
                    onClick={() => setActiveTooth(tooth)}
                  >
                    <span className="tooth-num" style={{ color: colors.text }}>{tooth}</span>
                    <ToothAnatomyIcon status={st} />
                    <span className="tooth-status-pill" style={{ color: colors.text }}>{st}</span>
                  </button>
                );
              })}
            </div>

            {/* Midline */}
            <div className="chart-midline">
              <div className="midline-track" />
              <span className="midline-text">Median Plane</span>
              <div className="midline-track" />
            </div>

            {/* Lower Jaw Quadrants */}
            <div className="quadrant-header-row">
              <span className="quadrant-badge">Q4 · Mandibular Right</span>
              <span className="quadrant-badge">Q3 · Mandibular Left</span>
            </div>

            <div className="tooth-row">
              {LOWER_RIGHT.map((tooth) => {
                const st = getToothStatus(tooth);
                const isAct = activeTooth === tooth;
                const colors = statusColors[st];
                return (
                  <button
                    type="button"
                    key={tooth}
                    className={`tooth-cell ${isAct ? "tooth-cell-active" : ""}`}
                    style={{ background: colors.bg, borderColor: isAct ? "var(--clinic-teal)" : colors.border }}
                    onClick={() => setActiveTooth(tooth)}
                  >
                    <span className="tooth-num" style={{ color: colors.text }}>{tooth}</span>
                    <ToothAnatomyIcon status={st} />
                    <span className="tooth-status-pill" style={{ color: colors.text }}>{st}</span>
                  </button>
                );
              })}

              <div className="midline-divider" />

              {LOWER_LEFT.map((tooth) => {
                const st = getToothStatus(tooth);
                const isAct = activeTooth === tooth;
                const colors = statusColors[st];
                return (
                  <button
                    type="button"
                    key={tooth}
                    className={`tooth-cell ${isAct ? "tooth-cell-active" : ""}`}
                    style={{ background: colors.bg, borderColor: isAct ? "var(--clinic-teal)" : colors.border }}
                    onClick={() => setActiveTooth(tooth)}
                  >
                    <span className="tooth-num" style={{ color: colors.text }}>{tooth}</span>
                    <ToothAnatomyIcon status={st} />
                    <span className="tooth-status-pill" style={{ color: colors.text }}>{st}</span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="chart-legend-row">
              <span className="legend-title">Legend:</span>
              {(Object.keys(statusLabels) as ToothCondition[]).map((cond) => (
                <span
                  key={cond}
                  className="legend-chip"
                  style={{ background: statusColors[cond].bg, borderColor: statusColors[cond].border, color: statusColors[cond].text }}
                >
                  <span className="legend-dot" style={{ background: statusColors[cond].dot }} />
                  {statusLabels[cond]}
                </span>
              ))}
            </div>
          </div>

          {/* Active Tooth Detail & Diagnosis Action Panel */}
          <div className="card active-tooth-panel">
            <div className="card-header tooth-detail-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span className="tooth-detail-num">Tooth #{activeTooth}</span>
                <span
                  className="badge"
                  style={{
                    background: statusColors[currentStatus].bg,
                    borderColor: statusColors[currentStatus].border,
                    color: statusColors[currentStatus].text,
                    border: "1px solid",
                  }}
                >
                  {statusLabels[currentStatus]}
                </span>
              </div>
              {saving && <span style={{ fontSize: "0.75rem", color: "var(--clinic-teal)" }}>Saving to database...</span>}
            </div>

            <div className="tooth-detail-body">
              <p style={{ margin: "0 0 0.85rem", fontSize: "0.82rem", color: "var(--clinic-muted)" }}>
                Click a status below to change finding for tooth #{activeTooth} and save to Supabase:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {(Object.keys(statusLabels) as ToothCondition[]).map((cond) => {
                  const isSelected = currentStatus === cond;
                  return (
                    <button
                      type="button"
                      key={cond}
                      className="button"
                      style={{
                        fontSize: "0.78rem",
                        padding: "0.4rem 0.8rem",
                        background: isSelected ? statusColors[cond].bg : "var(--clinic-surface)",
                        borderColor: isSelected ? statusColors[cond].text : "var(--clinic-hairline)",
                        color: isSelected ? statusColors[cond].text : "var(--clinic-ink)",
                        fontWeight: isSelected ? 700 : 500,
                        border: "1px solid",
                        cursor: "pointer",
                        borderRadius: "var(--radius-sm)",
                      }}
                      onClick={() => handleSetCondition(cond)}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: statusColors[cond].dot,
                          marginRight: "6px",
                        }}
                      />
                      {statusLabels[cond]}
                    </button>
                  );
                })}
              </div>
              {activeFinding?.notes && (
                <p style={{ margin: "0.85rem 0 0", fontSize: "0.8rem", color: "var(--clinic-muted)", fontStyle: "italic" }}>
                  Note: {activeFinding.notes}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
