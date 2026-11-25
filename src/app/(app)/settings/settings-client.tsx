"use client";

import { useState } from "react";
import { updateClinicSettings, toggleClinicIntegration, updateOpeningHours, setPublicPricelistAvailability } from "./actions";

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
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(initialSettings.openingHours);
  const [openingHoursSaving, setOpeningHoursSaving] = useState(false);
  const [publicPricelist, setPublicPricelist] = useState(initialSettings.publicPricelist ?? true);
  const [publicPricelistSaving, setPublicPricelistSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
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
          <p className="page-header-sub">Practice profile, opening hours, public website availability, and integrations</p>
        </div>
      </div>

      {savedNotification && (
        <div className="alert alert-warning" style={{ background: "var(--clinic-teal-tint)", borderColor: "var(--clinic-teal)", color: "var(--clinic-teal-deep)", marginBottom: "1.25rem" }}>
          <span>Clinic settings saved.</span>
        </div>
      )}
      {settingsError && (
        <div className="settings-save-error" role="alert">{settingsError}</div>
      )}

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
              <label>Tax ID</label>
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
        <section className="card settings-section settings-hours-section">
          <div className="card-header">
            <div>
              <h2>Opening hours</h2>
              <p className="settings-section-description">Choose which days the clinic is open and set its daily hours.</p>
            </div>
          </div>
          <form
            className="settings-body settings-hours-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setOpeningHoursSaving(true);
              setSettingsError("");
              try {
                await updateOpeningHours(openingHours);
                setSavedNotification(true);
                window.setTimeout(() => setSavedNotification(false), 3000);
              } catch (error) {
                setSettingsError(error instanceof Error ? error.message : "Unable to save opening hours.");
              } finally {
                setOpeningHoursSaving(false);
              }
            }}
          >
            <div className="hours-list">
              {openingHours.map((hour) => (
                <div key={hour.day} className="hours-row">
                  <span className="hours-day">{hour.day}</span>
                  <label className="hours-open-control">
                    <input
                      type="checkbox"
                      checked={hour.open}
                      onChange={(event) => {
                        const open = event.target.checked;
                        setOpeningHours((current) =>
                          current.map((entry) =>
                            entry.day === hour.day
                              ? {
                                  ...entry,
                                  open,
                                  from: open ? (entry.from.match(/^\d{2}:\d{2}$/) ? entry.from : "08:00") : entry.from,
                                  to: open ? (entry.to.match(/^\d{2}:\d{2}$/) ? entry.to : "17:00") : entry.to,
                                }
                              : entry
                          )
                        );
                      }}
                    />
                    <span>{hour.open ? "Open" : "Closed"}</span>
                  </label>
                  <label className="hours-time-field">
                    <span>Opens</span>
                    <input
                      type="time"
                      value={hour.open ? hour.from : ""}
                      disabled={!hour.open}
                      required={hour.open}
                      aria-label={hour.day + " opening time"}
                      onChange={(event) =>
                        setOpeningHours((current) =>
                          current.map((entry) => entry.day === hour.day ? { ...entry, from: event.target.value } : entry)
                        )
                      }
                    />
                  </label>
                  <label className="hours-time-field">
                    <span>Closes</span>
                    <input
                      type="time"
                      value={hour.open ? hour.to : ""}
                      disabled={!hour.open}
                      required={hour.open}
                      aria-label={hour.day + " closing time"}
                      onChange={(event) =>
                        setOpeningHours((current) =>
                          current.map((entry) => entry.day === hour.day ? { ...entry, to: event.target.value } : entry)
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="settings-actions">
              <button type="submit" disabled={openingHoursSaving} className="button button-primary">
                {openingHoursSaving ? "Saving hours..." : "Save opening hours"}
              </button>
            </div>
          </form>
        </section>
        {/* Ecosystem Integrations */}
        <section className="card settings-section" style={{ gridColumn: "1 / -1" }}>
          <div className="card-header">
            <div>
              <h2>Public website &amp; integrations</h2>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--clinic-muted)" }}>
                Control public Pricelist visibility and connected clinic services.
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
              <div className="integration-row">
                <span className="int-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5s-1.1 6.2-3.3 8.5c-2.2-2.3-3.3-5.1-3.3-8.5s1.1-6.2 3.3-8.5Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
                <div className="int-info">
                  <span className="int-name">Public Pricelist</span>
                  <span className="int-desc">Let visitors view treatment prices on the public website.</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={publicPricelist}
                  aria-label="Public Pricelist availability"
                  className={publicPricelist ? "toggle-switch toggle-on" : "toggle-switch"}
                  disabled={publicPricelistSaving}
                  onClick={async () => {
                    const nextValue = !publicPricelist;
                    setPublicPricelist(nextValue);
                    setPublicPricelistSaving(true);
                    setSettingsError("");
                    try {
                      await setPublicPricelistAvailability(nextValue);
                    } catch (error) {
                      setPublicPricelist(!nextValue);
                      setSettingsError(error instanceof Error ? error.message : "Unable to update public Pricelist availability.");
                    } finally {
                      setPublicPricelistSaving(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
