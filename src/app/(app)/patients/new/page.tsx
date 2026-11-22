import Link from "next/link";

export const metadata = { title: "New Patient — DentoRash" };

export default function NewPatientPage() {
  return (
    <div className="dashboard-wrap">
      <div className="page-header">
        <div>
          <Link href="/patients" className="back-link">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back to Patients
          </Link>
          <h1 className="page-title">Register New Patient</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "52rem" }}>
        <div className="card-header">
          <h2 className="card-title">Patient Details</h2>
          <span className="demo-flag">⚠ Demo — form not wired to backend</span>
        </div>
        <div className="settings-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
            <div className="settings-field">
              <label>First Name *</label>
              <input className="settings-input" type="text" placeholder="e.g. Rania" />
            </div>
            <div className="settings-field">
              <label>Last Name *</label>
              <input className="settings-input" type="text" placeholder="e.g. Al-Masri" />
            </div>
            <div className="settings-field">
              <label>Date of Birth *</label>
              <input className="settings-input" type="date" />
            </div>
            <div className="settings-field">
              <label>Gender</label>
              <select className="settings-input">
                <option value="">Select…</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="settings-field">
              <label>Phone Number *</label>
              <input className="settings-input" type="tel" placeholder="+966 5x xxx xxxx" />
            </div>
            <div className="settings-field">
              <label>Email Address</label>
              <input className="settings-input" type="email" placeholder="patient@email.com" />
            </div>
            <div className="settings-field" style={{ gridColumn: "1 / -1" }}>
              <label>Address</label>
              <input className="settings-input" type="text" placeholder="Street, City" />
            </div>
            <div className="settings-field">
              <label>National ID / Iqama</label>
              <input className="settings-input" type="text" placeholder="1xxxxxxxxx" />
            </div>
            <div className="settings-field">
              <label>Blood Type</label>
              <select className="settings-input">
                <option value="">Unknown</option>
                {["A+","A−","B+","B−","O+","O−","AB+","AB−"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--clinic-hairline)", margin: "0.5rem 0" }} />

          <p className="settings-hint" style={{ fontWeight: 600 }}>Insurance</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
            <div className="settings-field">
              <label>Insurance Provider</label>
              <input className="settings-input" type="text" placeholder="e.g. Bupa Arabia" />
            </div>
            <div className="settings-field">
              <label>Policy Number</label>
              <input className="settings-input" type="text" placeholder="POL-xxxxxxx" />
            </div>
            <div className="settings-field">
              <label>Coverage %</label>
              <input className="settings-input" type="number" min="0" max="100" placeholder="80" />
            </div>
            <div className="settings-field">
              <label>Annual Limit (SAR)</label>
              <input className="settings-input" type="number" placeholder="10000" />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--clinic-hairline)", margin: "0.5rem 0" }} />

          <div className="settings-field">
            <label>Known Allergies</label>
            <input className="settings-input" type="text" placeholder="e.g. Penicillin, Latex (comma-separated)" />
          </div>
          <div className="settings-field">
            <label>Medical Notes</label>
            <textarea
              className="settings-input"
              rows={3}
              placeholder="Pre-existing conditions, medications, special considerations…"
              style={{ height: "auto", padding: "0.5rem 0.75rem", resize: "vertical" }}
            />
          </div>

          <div className="settings-actions">
            <button className="button button-primary" disabled>
              Save Patient
            </button>
            <Link href="/patients" className="button button-secondary">
              Cancel
            </Link>
            <span className="settings-hint">Backend integration coming in Phase 5.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
