"use client";

import { useState } from "react";
import "@/app/(app)/internal.css";
import { demoPatients } from "@/lib/demo-data";
import Link from "next/link";

// FDI tooth numbering: 11-18 upper right, 21-28 upper left, 31-38 lower left, 41-48 lower right
// Synthetic status per demo patient P-003 treatment plan
const TOOTH_STATUS: Record<string, { status: "healthy" | "filled" | "missing" | "crown" | "rct" | "implant" | "decay"; patientId?: string }> = {
  "16": { status: "crown", patientId: "P-003" },
  "26": { status: "rct", patientId: "P-003" },
  "14": { status: "decay", patientId: "P-003" },
  "11": { status: "implant", patientId: "P-006" },
};

const statusColors: Record<string, string> = {
  healthy: "var(--clinic-teal-tint)",
  filled: "#d6eaff",
  missing: "#f1f1f1",
  crown: "#fff4e3",
  rct: "#ffe8e8",
  implant: "#e3f2ff",
  decay: "#fdeaea",
};

const statusLabels: Record<string, string> = {
  healthy: "Healthy",
  filled: "Filled",
  missing: "Missing",
  crown: "Crown",
  rct: "RCT",
  implant: "Implant",
  decay: "Decay / Caries",
};

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

function ToothCell({ tooth, selectedPatient }: { tooth: number; selectedPatient: string | null }) {
  const toothStr = String(tooth);
  const data = TOOTH_STATUS[toothStr];
  const isPatientTooth = data && (!selectedPatient || data.patientId === selectedPatient);
  const status = isPatientTooth ? data.status : "healthy";
  const bg = statusColors[status];

  return (
    <div
      className="tooth-cell"
      style={{ background: bg }}
      title={`${toothStr} — ${statusLabels[status]}`}
      role="button"
      tabIndex={0}
      aria-label={`Tooth ${toothStr}, status: ${statusLabels[status]}`}
    >
      <span className="tooth-num">{toothStr}</span>
      <div className="tooth-crown-shape" aria-hidden="true" />
    </div>
  );
}

export default function Clinical() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>("P-003");
  const selectedPatientData = selectedPatient ? demoPatients.find((p) => p.id === selectedPatient) : null;

  return (
    <div className="clinical-wrap">
      <div className="page-header">
        <div>
          <h1>Tooth Chart</h1>
          <p>FDI notation · synthetic demo data</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="button button-secondary">Print chart</button>
          <button type="button" className="button button-primary">Record finding</button>
        </div>
      </div>

      <div className="clinical-grid">
        {/* Patient selector */}
        <aside className="card clinical-sidebar">
          <div className="card-header"><h2>Select patient</h2></div>
          <ul className="patient-selector-list">
            {demoPatients.filter((p) => p.status !== "inactive").map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`patient-selector-btn${selectedPatient === p.id ? " selected" : ""}`}
                  onClick={() => setSelectedPatient(p.id)}
                >
                  <div className="patient-selector-name">{p.name}</div>
                  <div className="patient-selector-meta">{p.id} · {p.status}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chart */}
        <div>
          {selectedPatientData && (
            <div className="clinical-patient-banner">
              <div>
                <Link href={`/patients/${selectedPatientData.id}`} className="patient-name" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {selectedPatientData.name}
                </Link>
                <span style={{ marginLeft: "0.75rem", color: "var(--clinic-muted)", fontSize: "0.82rem" }}>
                  {selectedPatientData.id} · DOB {selectedPatientData.dob} · {selectedPatientData.bloodType}
                </span>
              </div>
              {selectedPatientData.allergies.length > 0 && (
                <span className="allergy-pill">
                  ⚠ Allergies: {selectedPatientData.allergies.join(", ")}
                </span>
              )}
            </div>
          )}

          <div className="chart-container card">
            <div className="chart-label-row">
              <span className="chart-quadrant-label">Upper Right (UR)</span>
              <span className="chart-quadrant-label">Upper Left (UL)</span>
            </div>
            <div className="tooth-row">
              {UPPER_RIGHT.map((t) => (
                <ToothCell key={t} tooth={t} selectedPatient={selectedPatient} />
              ))}
              <div className="tooth-divider" aria-hidden="true" />
              {UPPER_LEFT.map((t) => (
                <ToothCell key={t} tooth={t} selectedPatient={selectedPatient} />
              ))}
            </div>

            <div className="chart-midline" aria-hidden="true">
              <span>Maxillary</span>
              <div className="midline" />
              <span>Mandibular</span>
            </div>

            <div className="tooth-row">
              {LOWER_RIGHT.map((t) => (
                <ToothCell key={t} tooth={t} selectedPatient={selectedPatient} />
              ))}
              <div className="tooth-divider" aria-hidden="true" />
              {LOWER_LEFT.map((t) => (
                <ToothCell key={t} tooth={t} selectedPatient={selectedPatient} />
              ))}
            </div>
            <div className="chart-label-row">
              <span className="chart-quadrant-label">Lower Right (LR)</span>
              <span className="chart-quadrant-label">Lower Left (LL)</span>
            </div>

            {/* Legend */}
            <div className="chart-legend-row">
              {Object.entries(statusLabels).map(([key, label]) => (
                <span key={key} className="legend-item">
                  <span className="legend-swatch" style={{ background: statusColors[key] }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Findings table */}
          {selectedPatientData && (
            <div className="card" style={{ marginTop: "1rem" }}>
              <div className="card-header"><h2>Recorded findings</h2></div>
              <div className="table-wrap" style={{ margin: 0, border: "none", borderRadius: 0 }}>
                <table className="data-table" aria-label="Tooth findings">
                  <thead>
                    <tr>
                      <th scope="col">Tooth</th>
                      <th scope="col">Status</th>
                      <th scope="col">Associated plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(TOOTH_STATUS)
                      .filter(([, v]) => v.patientId === selectedPatient)
                      .map(([tooth, data]) => (
                        <tr key={tooth}>
                          <td className="numeric" style={{ fontWeight: 600 }}>{tooth}</td>
                          <td>
                            <span className="legend-swatch" style={{ background: statusColors[data.status], display: "inline-block", width: "0.75rem", height: "0.75rem", borderRadius: "2px", marginRight: "0.4rem" }} />
                            {statusLabels[data.status]}
                          </td>
                          <td>
                            <Link href="/treatment-plans" className="patient-name" style={{ fontSize: "0.82rem" }}>
                              Treatment plan →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    {Object.entries(TOOTH_STATUS).filter(([, v]) => v.patientId === selectedPatient).length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ color: "var(--clinic-muted)", textAlign: "center", padding: "1.5rem" }}>
                          No findings recorded for this patient.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
