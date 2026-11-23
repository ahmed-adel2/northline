"use client";

import { useState } from "react";
import { updateClinicSettings, toggleClinicIntegration } from "./actions";

interface IntegrationItem {
  name: string;
  status: "connected" | "not-connected";
  icon: string;
  description: string;
}

interface OpeningHour {
  day: string;
  from: string;
  to: string;
  open: boolean;
}

interface SettingsClientProps {
  initialSettings: {
    clinicName: string;
    branchName: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    taxId: string | null;
    publicPricelist: boolean | null;
    openingHours: OpeningHour[];
    integrations: IntegrationItem[];
  };
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [clinicName, setClinicName] = useState(initialSettings.clinicName || "Northline Dental Clinic");
  const [branchName, setBranchName] = useState(initialSettings.branchName || "Main Branch");
  const [address, setAddress] = useState(initialSettings.address || "1 Tahrir Square, Downtown, Cairo, Egypt");
  const [phone, setPhone] = useState(initialSettings.phone || "+20 2 2222 3333");
  const [email, setEmail] = useState(initialSettings.email || "hello@northline.clinic");
  const [taxId, setTaxId] = useState(initialSettings.taxId || "310122393500003");
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(initialSettings.integrations || []);
  const [saving, setSaving] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveClinicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("clinicName", clinicName);
    fd.append("branchName", branchName);
    fd.append("address", address);
    fd.append("phone", phone);
    fd.append("email", email);
    fd.append("taxId", taxId);

    try {
      await updateClinicSettings(fd);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    } catch (err) {
      alert("Failed to save settings: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleIntegration = async (name: string, currentStatus: "connected" | "not-connected") => {
    const nextStatus = currentStatus === "connected" ? "not-connected" : "connected";
    setIntegrations((prev) =>
      prev.map((item) => (item.name === name ? { ...item, status: nextStatus } : item))
    );
    try {
      await toggleClinicIntegration(name, nextStatus);
    } catch {
      // Revert on failure
      setIntegrations((prev) =>
        prev.map((item) => (item.name === name ? { ...item, status: currentStatus } : item))
      );
      alert("Failed to update integration in database");
    }
  };

  return (
    <div className="settings-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Clinic Operating System</span>
          </div>
          <h1>Clinic Settings</h1>
          <p className="page-header-sub">Practice profile, operatory working hours, integration keys, and database controls</p>
        </div>
      </div>

      {savedNotification && (
        <div className="alert alert-warning" style={{ background: "var(--clinic-teal-tint)", borderColor: "var(--clinic-teal)", color: "var(--clinic-teal-deep)", marginBottom: "1.25rem" }}>
          <span>✓ Clinic settings successfully saved to Supabase database &amp; audit log!</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Clinic info */}
        <section className="card settings-section">
          <div className="card-header">
            <h2>Clinic information</h2>
          </div>
          <form onSubmit={handleSaveClinicInfo} className="settings-body">
            <div className="settings-field">
              <label>Clinic name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="settings-input"
                required
              />
            </div>
            <div className="settings-field">
              <label>Branch name</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="settings-input"
              />
            </div>
            <div className="settings-field">
              <label>Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="settings-input"
              />
            </div>
            <div className="settings-field">
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="settings-input"
              />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="settings-input"
              />
            </div>
            <div className="settings-field">
              <label>Tax ID (for ZATCA / e-invoicing)</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="settings-input"
              />
            </div>
            <div className="settings-actions">
              <button type="submit" disabled={saving} className="button button-primary">
                {saving ? "Saving to database..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Working hours */}
        <section className="card settings-section">
          <div className="card-header">
            <h2>Opening hours</h2>
          </div>
          <div className="settings-body">
            {initialSettings.openingHours?.map(({ day, from, to, open }) => (
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

        {/* Ecosystem Integrations */}
        <section className="card settings-section" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <div>
              <h2>Ecosystem &amp; cloud integrations</h2>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--clinic-muted)" }}>
                Changes are immediately synced and stored in Supabase database.
              </p>
            </div>
          </div>
          <div className="settings-body">
            <div className="integration-list">
              {integrations.map((item) => (
                <div key={item.name} className="integration-row">
                  <span className="int-icon">{item.icon}</span>
                  <div className="int-info">
                    <span className="int-name">{item.name}</span>
                    <span className="int-desc">{item.description}</span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch ${item.status === "connected" ? "toggle-on" : ""}`}
                    onClick={() => handleToggleIntegration(item.name, item.status)}
                    title={`Click to ${item.status === "connected" ? "disconnect" : "connect"}`}
                    aria-label={`Toggle ${item.name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
