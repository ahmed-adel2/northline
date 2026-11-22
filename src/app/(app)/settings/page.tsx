import "@/app/(app)/internal.css";

export default function Settings() {
  return (
    <div className="settings-wrap">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Clinic configuration and system preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Clinic info */}
        <section className="card settings-section">
          <div className="card-header"><h2>Clinic information</h2></div>
          <div className="settings-body">
            <div className="settings-field">
              <label>Clinic name</label>
              <input type="text" defaultValue="Northline Dental Clinic" readOnly className="settings-input" />
            </div>
            <div className="settings-field">
              <label>Branch name</label>
              <input type="text" defaultValue="Main Branch" readOnly className="settings-input" />
            </div>
            <div className="settings-field">
              <label>Address</label>
              <input type="text" defaultValue="1 Tahrir Square, Downtown, Cairo, Egypt" readOnly className="settings-input" />
            </div>
            <div className="settings-field">
              <label>Phone</label>
              <input type="tel" defaultValue="+20 2 2222 3333" readOnly className="settings-input" />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input type="email" defaultValue="hello@northline.clinic" readOnly className="settings-input" />
            </div>
            <div className="settings-field">
              <label>Tax ID (for ZATCA / e-invoicing)</label>
              <input type="text" defaultValue="310122393500003" readOnly className="settings-input" />
            </div>
            <div className="settings-actions">
              <button type="button" className="button button-primary" disabled>Save changes</button>
              <span className="settings-hint">Settings editing is disabled in this demo.</span>
            </div>
          </div>
        </section>

        {/* Working hours */}
        <section className="card settings-section">
          <div className="card-header"><h2>Opening hours</h2></div>
          <div className="settings-body">
            {[
              { day: "Sunday", from: "08:00", to: "17:00", open: true },
              { day: "Monday", from: "08:00", to: "17:00", open: true },
              { day: "Tuesday", from: "08:00", to: "17:00", open: true },
              { day: "Wednesday", from: "08:00", to: "17:00", open: true },
              { day: "Thursday", from: "08:00", to: "14:00", open: true },
              { day: "Friday", from: "—", to: "—", open: false },
              { day: "Saturday", from: "09:00", to: "13:00", open: true },
            ].map(({ day, from, to, open }) => (
              <div key={day} className="hours-row">
                <span className="hours-day">{day}</span>
                {open ? (
                  <span className="hours-range">{from} – {to}</span>
                ) : (
                  <span className="hours-closed">Closed</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pricelist visibility */}
        <section className="card settings-section">
          <div className="card-header"><h2>Public pricelist</h2></div>
          <div className="settings-body">
            <div className="settings-toggle-row">
              <div>
                <span style={{ fontWeight: 550, fontSize: "0.88rem" }}>Publish pricelist on public site</span>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.78rem", color: "var(--clinic-muted)" }}>
                  When enabled, the internal pricelist snapshot is visible on the public clinic page. Any price change requires a manual re-publish.
                </p>
              </div>
              <div className="toggle-switch toggle-on" aria-label="Pricelist published" role="switch" aria-checked="true" />
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="card settings-section" style={{ gridColumn: "span 2" }}>
          <div className="card-header"><h2>Integrations</h2></div>
          <div className="settings-body">
            <div className="integration-list">
              {[
                { name: "Google Calendar", status: "connected", icon: "📅", description: "Two-way sync per doctor." },
                { name: "Google Drive", status: "connected", icon: "☁️", description: "Automatic daily backup." },
                { name: "WhatsApp Business", status: "not-connected", icon: "💬", description: "Automated appointment reminders and recalls (requires Cloud API access)." },
                { name: "Resend (Email)", status: "connected", icon: "✉️", description: "Transactional emails and recall campaigns." },
                { name: "Cloudflare R2", status: "connected", icon: "📁", description: "Patient file and image storage." },
                { name: "ZATCA e-Invoicing", status: "not-connected", icon: "🧾", description: "Phase 2 clearance adapter — pending certification." },
                { name: "NPHIES Insurance", status: "not-connected", icon: "🏥", description: "Saudi insurance claims gateway — adapter only in v1." },
              ].map((int) => (
                <div key={int.name} className="integration-row">
                  <span className="int-icon">{int.icon}</span>
                  <div className="int-info">
                    <span className="int-name">{int.name}</span>
                    <span className="int-desc">{int.description}</span>
                  </div>
                  <span className={`badge${int.status === "connected" ? " badge-active" : " badge-overdue"}`}>
                    {int.status === "connected" ? "Connected" : "Not connected"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="card settings-section">
          <div className="card-header"><h2>Security &amp; access</h2></div>
          <div className="settings-body">
            <div className="settings-info-row">
              <span>Authentication provider</span>
              <span className="badge badge-active">Clerk</span>
            </div>
            <div className="settings-info-row">
              <span>Role-based access</span>
              <span className="badge badge-active">Enabled</span>
            </div>
            <div className="settings-info-row">
              <span>Audit logging</span>
              <span className="badge badge-active">Active</span>
            </div>
            <div className="settings-info-row">
              <span>Data encryption (at rest)</span>
              <span className="badge badge-active">AES-256</span>
            </div>
            <div className="settings-info-row">
              <span>Data encryption (in transit)</span>
              <span className="badge badge-active">TLS 1.3</span>
            </div>
            <div className="settings-info-row">
              <span>Admin portal access</span>
              <span className="badge badge-active">Clerk role: admin</span>
            </div>
            <div className="settings-info-row">
              <span>Public site access</span>
              <span style={{ fontSize: "0.78rem", color: "var(--clinic-muted)" }}>No authentication required</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
