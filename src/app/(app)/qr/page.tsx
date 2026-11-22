import "@/app/(app)/internal.css";
import { demoPatients } from "@/lib/demo-data";

export default function QRCodes() {
  return (
    <div className="qr-wrap">
      <div className="page-header">
        <div>
          <h1>QR Codes</h1>
          <p>Generate patient check-in QR codes and clinic access links.</p>
        </div>
      </div>

      {/* Clinic-wide QR */}
      <section className="card qr-section">
        <div className="card-header">
          <h2>Clinic check-in QR</h2>
        </div>
        <div className="qr-clinic-body">
          <div className="qr-code-block">
            <div className="qr-placeholder" aria-label="QR code for clinic check-in">
              <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" width="120" height="120">
                {/* Finder patterns */}
                <rect x="8" y="8" width="30" height="30" rx="3" fill="var(--clinic-ink)" />
                <rect x="12" y="12" width="22" height="22" rx="2" fill="white" />
                <rect x="16" y="16" width="14" height="14" rx="1" fill="var(--clinic-ink)" />
                <rect x="82" y="8" width="30" height="30" rx="3" fill="var(--clinic-ink)" />
                <rect x="86" y="12" width="22" height="22" rx="2" fill="white" />
                <rect x="90" y="16" width="14" height="14" rx="1" fill="var(--clinic-ink)" />
                <rect x="8" y="82" width="30" height="30" rx="3" fill="var(--clinic-ink)" />
                <rect x="12" y="86" width="22" height="22" rx="2" fill="white" />
                <rect x="16" y="90" width="14" height="14" rx="1" fill="var(--clinic-ink)" />
                {/* Data modules */}
                {[46,50,54,58,62,66,70,74].map((x, i) => (
                  <rect key={i} x={x} y="8" width="4" height="4" fill={i%2===0 ? "var(--clinic-ink)":"transparent"} />
                ))}
                {[8,12,16,20,24,28,32,36].map((y, i) => (
                  <rect key={i} x="46" y={y+6} width="4" height="4" fill={i%3===0 ? "var(--clinic-ink)":"transparent"} />
                ))}
                {[46,54,62,70,78].map((x, i) => (
                  <rect key={i} x={x} y="46" width="4" height="4" fill="var(--clinic-ink)" />
                ))}
                {[46,50,58,62,70,74,78].map((x, i) => (
                  <rect key={i} x={x} y="58" width="4" height="4" fill={i%2===1 ? "var(--clinic-ink)":"transparent"} />
                ))}
                {[46,54,58,66,70,74].map((x, i) => (
                  <rect key={i} x={x} y="70" width="4" height="4" fill="var(--clinic-ink)" />
                ))}
                {[46,50,54,62,70,78].map((x, i) => (
                  <rect key={i} x={x} y="82" width="4" height="4" fill={i%2===0 ? "var(--clinic-ink)":"transparent"} />
                ))}
              </svg>
            </div>
            <span className="qr-label">northline.clinic/checkin</span>
          </div>
          <div className="qr-clinic-info">
            <h3>Northline Dental Clinic — Main Branch</h3>
            <p>Patients scan this code at reception to register their arrival. The check-in link opens the patient-facing form; no staff account is required.</p>
            <div className="qr-url-row">
              <code className="qr-url">https://northline.clinic/checkin</code>
              <button className="button button-secondary" type="button">Copy link</button>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button className="button button-primary" type="button">Download PNG</button>
              <button className="button button-secondary" type="button">Download PDF</button>
              <button className="button button-secondary" type="button">Print</button>
            </div>
          </div>
        </div>
      </section>

      {/* Per-patient QR */}
      <section className="card qr-section" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <h2>Patient QR codes</h2>
          <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)" }}>
            Each patient&apos;s QR links directly to their check-in with pre-filled details.
          </span>
        </div>
        <div className="qr-patient-grid">
          {demoPatients.filter((p) => p.status !== "inactive").map((patient) => (
            <div key={patient.id} className="qr-patient-card">
              <div className="qr-mini" aria-label={`QR for ${patient.name}`}>
                <svg viewBox="0 0 60 60" fill="none" aria-hidden="true" width="60" height="60">
                  <rect x="4" y="4" width="15" height="15" rx="1.5" fill="var(--clinic-ink)" />
                  <rect x="6" y="6" width="11" height="11" rx="1" fill="white" />
                  <rect x="8" y="8" width="7" height="7" rx="0.5" fill="var(--clinic-ink)" />
                  <rect x="41" y="4" width="15" height="15" rx="1.5" fill="var(--clinic-ink)" />
                  <rect x="43" y="6" width="11" height="11" rx="1" fill="white" />
                  <rect x="45" y="8" width="7" height="7" rx="0.5" fill="var(--clinic-ink)" />
                  <rect x="4" y="41" width="15" height="15" rx="1.5" fill="var(--clinic-ink)" />
                  <rect x="6" y="43" width="11" height="11" rx="1" fill="white" />
                  <rect x="8" y="45" width="7" height="7" rx="0.5" fill="var(--clinic-ink)" />
                  {[23,27,31,35,39].map((x, i) => (
                    <rect key={i} x={x} y="4" width="3" height="3" fill={i%2===0?"var(--clinic-ink)":"transparent"} />
                  ))}
                  {[23,27,31,35,39].map((x, i) => (
                    <rect key={i} x={x} y="23" width="3" height="3" fill="var(--clinic-ink)" />
                  ))}
                  {[23,27,31,35,39,43,47].map((x, i) => (
                    <rect key={i} x={x} y="31" width="3" height="3" fill={i%3===0?"var(--clinic-ink)":"transparent"} />
                  ))}
                  {[23,27,35,39,47].map((x, i) => (
                    <rect key={i} x={x} y="39" width="3" height="3" fill="var(--clinic-ink)" />
                  ))}
                  {[27,31,43,47].map((x, i) => (
                    <rect key={i} x={x} y="47" width="3" height="3" fill={i%2===0?"var(--clinic-ink)":"transparent"} />
                  ))}
                </svg>
              </div>
              <div className="qr-patient-info">
                <span className="qr-patient-name">{patient.name}</span>
                <span className="qr-patient-id">{patient.id}</span>
              </div>
              <div className="qr-patient-actions">
                <button className="button button-secondary" type="button" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>Download</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
