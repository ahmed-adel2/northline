"use client";

import { useState } from "react";
import { demoPatients } from "@/lib/demo-data";

export default function QRCodes() {
  const [copied, setCopied] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");

  const filteredPatients = demoPatients.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://northline.clinic/checkin");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadClinicQR = (filename: string) => {
    // Generate clean downloadable SVG data
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

  const downloadPatientQR = (patientName: string, patientId: string) => {
    const text = `Northline Dental Clinic Self Check-in Pass\nPatient: ${patientName} (${patientId})\nURL: https://northline.clinic/checkin?p=${patientId}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Checkin-Pass-${patientId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="qr-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Contactless Reception</span>
          </div>
          <h1>QR Access &amp; Check-in</h1>
          <p className="page-header-sub">Generate clinic reception kiosks and individual patient self-check-in passes</p>
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
              <svg id="clinic-qr-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true" width="130" height="130">
                <rect width="120" height="120" fill="white" />
                {/* Finder patterns */}
                <rect x="8" y="8" width="30" height="30" rx="3" fill="#132a2c" />
                <rect x="12" y="12" width="22" height="22" rx="2" fill="white" />
                <rect x="16" y="16" width="14" height="14" rx="1" fill="#132a2c" />
                <rect x="82" y="8" width="30" height="30" rx="3" fill="#132a2c" />
                <rect x="86" y="12" width="22" height="22" rx="2" fill="white" />
                <rect x="90" y="16" width="14" height="14" rx="1" fill="#132a2c" />
                <rect x="8" y="82" width="30" height="30" rx="3" fill="#132a2c" />
                <rect x="12" y="86" width="22" height="22" rx="2" fill="white" />
                <rect x="16" y="90" width="14" height="14" rx="1" fill="#132a2c" />
                {/* Data modules */}
                {[46,50,54,58,62,66,70,74].map((x, i) => (
                  <rect key={i} x={x} y="8" width="4" height="4" fill={i%2===0 ? "#132a2c":"transparent"} />
                ))}
                {[8,12,16,20,24,28,32,36].map((y, i) => (
                  <rect key={i} x="46" y={y+6} width="4" height="4" fill={i%3===0 ? "#132a2c":"transparent"} />
                ))}
                {[46,54,62,70,78].map((x, i) => (
                  <rect key={i} x={x} y="46" width="4" height="4" fill="#132a2c" />
                ))}
                {[46,50,58,62,70,74,78].map((x, i) => (
                  <rect key={i} x={x} y="58" width="4" height="4" fill={i%2===1 ? "#132a2c":"transparent"} />
                ))}
                {[46,54,58,66,70,74].map((x, i) => (
                  <rect key={i} x={x} y="70" width="4" height="4" fill="#132a2c" />
                ))}
                {[46,50,54,62,70,78].map((x, i) => (
                  <rect key={i} x={x} y="82" width="4" height="4" fill={i%2===0 ? "#132a2c":"transparent"} />
                ))}
              </svg>
            </div>
            <span className="qr-label">northline.clinic/checkin</span>
          </div>
          <div className="qr-clinic-info" style={{ flex: 1, minWidth: "260px" }}>
            <h3>Northline Dental Clinic — Main Branch Kiosk</h3>
            <p>Patients scan this code at reception to register their arrival. The check-in link opens the patient-facing form immediately; no staff account or app install required.</p>
            <div className="qr-url-row">
              <code className="qr-url">https://northline.clinic/checkin</code>
              <button className="button button-secondary" type="button" onClick={handleCopyLink}>
                {copied ? "✓ Copied to clipboard!" : "Copy link"}
              </button>
            </div>
            <div className="header-actions" style={{ marginTop: "1rem" }}>
              <button className="button button-primary" type="button" onClick={() => downloadClinicQR("Northline-Clinic-Checkin-QR.svg")}>
                Download SVG/PNG
              </button>
              <button className="button button-secondary" type="button" onClick={() => window.print()}>
                Print Reception Poster
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Per-patient QR */}
      <section className="card qr-section" style={{ marginTop: "1.5rem" }}>
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2>Patient QR passes</h2>
            <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)" }}>
              Direct personalized check-in passes with pre-filled medical file number.
            </span>
          </div>
          <input
            type="search"
            placeholder="Search patient pass…"
            className="filter-search"
            style={{ maxWidth: "240px", height: "2.3rem", fontSize: "0.82rem" }}
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />
        </div>
        <div className="qr-patient-grid">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="qr-patient-card">
              <div className="qr-mini" aria-label={`QR for ${patient.name}`}>
                <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" width="56" height="56">
                  <rect x="4" y="4" width="15" height="15" rx="1.5" fill="#132a2c" />
                  <rect x="6" y="6" width="11" height="11" rx="1" fill="white" />
                  <rect x="8" y="8" width="7" height="7" rx="0.5" fill="#132a2c" />
                  <rect x="41" y="4" width="15" height="15" rx="1.5" fill="#132a2c" />
                  <rect x="43" y="6" width="11" height="11" rx="1" fill="white" />
                  <rect x="45" y="8" width="7" height="7" rx="0.5" fill="#132a2c" />
                  <rect x="4" y="41" width="15" height="15" rx="1.5" fill="#132a2c" />
                  <rect x="6" y="43" width="11" height="11" rx="1" fill="white" />
                  <rect x="8" y="45" width="7" height="7" rx="0.5" fill="#132a2c" />
                  {[23,27,31,35,39].map((x, i) => (
                    <rect key={i} x={x} y="4" width="3" height="3" fill={i%2===0?"#132a2c":"transparent"} />
                  ))}
                  {[23,27,31,35,39].map((x, i) => (
                    <rect key={i} x={x} y="23" width="3" height="3" fill="#132a2c" />
                  ))}
                  {[23,27,31,35,39,43,47].map((x, i) => (
                    <rect key={i} x={x} y="31" width="3" height="3" fill={i%3===0?"#132a2c":"transparent"} />
                  ))}
                  {[23,27,35,39,47].map((x, i) => (
                    <rect key={i} x={x} y="39" width="3" height="3" fill="#132a2c" />
                  ))}
                  {[27,31,43,47].map((x, i) => (
                    <rect key={i} x={x} y="47" width="3" height="3" fill={i%2===0?"#132a2c":"transparent"} />
                  ))}
                </svg>
              </div>
              <div className="qr-patient-info">
                <span className="qr-patient-name">{patient.name}</span>
                <span className="qr-patient-id">{patient.id}</span>
              </div>
              <div className="qr-patient-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", minHeight: "36px" }}
                  onClick={() => downloadPatientQR(patient.name, patient.id)}
                >
                  Download pass
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
