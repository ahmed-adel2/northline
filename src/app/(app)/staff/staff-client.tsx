"use client";

import { useState } from "react";
import { createStaffMember, toggleStaffStatus } from "./actions";
import { Staff } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DEFAULT_DAYS = [
  { day: "Sun", active: true },
  { day: "Mon", active: true },
  { day: "Tue", active: true },
  { day: "Wed", active: true },
  { day: "Thu", active: true },
  { day: "Sat", active: false },
];

export function StaffClient({ initialStaff }: { initialStaff: Staff[] }) {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New staff form state
  const [newName, setNewName] = useState("");
  const [newRoleType, setNewRoleType] = useState<"doctor" | "support">("doctor");
  const [newSpecialty, setNewSpecialty] = useState("Endodontics & Restorative");
  const [newSupportRole, setNewSupportRole] = useState("Dental Assistant");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("+20 100 ");
  const [newCommission, setNewCommission] = useState("35");

  const doctors = staffList.filter((s) => s.role === "dentist" || s.role === "owner");
  const supportPersonnel = staffList.filter((s) => s.role === "receptionist");

  // Toggle status in database
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !currentActive } : s))
    );
    try {
      await toggleStaffStatus(id, currentActive);
    } catch (err) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: currentActive } : s))
      );
      alert("Failed to toggle status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Add staff member to database
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    const formattedName = newRoleType === "doctor" && !newName.startsWith("Dr.") ? `Dr. ${newName}` : newName;
    fd.append("fullName", formattedName);
    fd.append("roleType", newRoleType);
    fd.append("specialty", newSpecialty);
    fd.append("supportRole", newSupportRole);
    fd.append("email", newEmail || `${newName.toLowerCase().replace(/[^a-z]/g, "")}@northline.clinic`);
    fd.append("phone", newPhone);
    fd.append("commissionRate", newCommission);

    try {
      const res = await createStaffMember(fd);
      if (res.ok && res.data) {
        setStaffList([res.data as Staff, ...staffList]);
        setIsModalOpen(false);
        setNewName("");
      }
    } catch (err) {
      alert("Failed to create staff member: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="team-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Practice Practitioners</span>
          </div>
          <h1>Clinical &amp; Administrative Team</h1>
          <p className="page-header-sub">{doctors.length} doctors · {supportPersonnel.length} support personnel · Synced to Supabase database</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-primary" onClick={() => setIsModalOpen(true)}>
            <span>Add staff member</span> <ArrowUpRight />
          </button>
        </div>
      </div>

      {/* Doctors */}
      <section>
        <h2 className="section-heading">Clinical Dentists &amp; Specialists</h2>
        <div className="team-grid">
          {doctors.map((doc) => {
            const color = doc.color || "#087f80";
            const initials = doc.fullName.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2);
            return (
              <div key={doc.id} className="team-card card">
                <div className="team-card-header">
                  <div className="team-avatar" style={{ background: color + "22", color }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="team-name">{doc.fullName}</span>
                    <span className="team-specialty">{doc.specialty || "General Dentist"}</span>
                  </div>
                  <button
                    type="button"
                    className={`badge badge-${doc.active ? "active" : "inactive"}`}
                    style={{ marginLeft: "auto", cursor: "pointer", border: "1px solid" }}
                    onClick={() => handleToggleStatus(doc.id, doc.active)}
                    title="Click to toggle status"
                  >
                    {doc.active ? "active" : "inactive"} ↺
                  </button>
                </div>

                <dl className="team-facts">
                  <div>
                    <dt>Phone</dt>
                    <dd>{doc.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{doc.email || "—"}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd style={{ textTransform: "capitalize" }}>{doc.role}</dd>
                  </div>
                  <div>
                    <dt>Commission</dt>
                    <dd>{doc.commissionRate || "0"}%</dd>
                  </div>
                </dl>

                <div className="team-schedule">
                  <span className="team-facts-label">Working Schedule</span>
                  <div className="schedule-chips">
                    {DEFAULT_DAYS.map((d) => (
                      <span key={d.day} className={`day-chip ${d.active ? "day-chip-active" : ""}`}>
                        {d.day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Staff */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2 className="section-heading">Support &amp; Administrative Personnel</h2>
        <div className="table-wrap card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role / Assignment</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supportPersonnel.map((staff) => (
                <tr key={staff.id}>
                  <td style={{ fontWeight: 650 }}>{staff.fullName}</td>
                  <td>{staff.specialty || "Receptionist"}</td>
                  <td>{staff.email || "—"}</td>
                  <td>{staff.phone || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge badge-${staff.active ? "active" : "inactive"}`}
                      style={{ cursor: "pointer", border: "1px solid" }}
                      onClick={() => handleToggleStatus(staff.id, staff.active)}
                    >
                      {staff.active ? "active" : "inactive"} ↺
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Human Resources &amp; Roster</span>
                <h2>Add Practice Staff Member</h2>
                <p>Onboard clinical practitioners, specialists, and administrative personnel</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddStaff} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>Staff Classification</label>
                  <div className="modal-role-segmented">
                    <label className={`modal-role-option ${newRoleType === "doctor" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="roleType"
                        checked={newRoleType === "doctor"}
                        onChange={() => setNewRoleType("doctor")}
                      />
                      <span>🩺 Clinical Dentist / Specialist</span>
                    </label>
                    <label className={`modal-role-option ${newRoleType === "support" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="roleType"
                        checked={newRoleType === "support"}
                        onChange={() => setNewRoleType("support")}
                      />
                      <span>📋 Support Personnel</span>
                    </label>
                  </div>
                </div>

                <div className="modal-field">
                  <label>
                    Full Name
                    <span className="modal-field-hint">Official identification</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newRoleType === "doctor" ? "e.g. Dr. Hisham Talaat, DDS" : "e.g. Karim Sabry"}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="modal-input"
                  />
                </div>

                {newRoleType === "doctor" ? (
                  <div className="modal-grid-2">
                    <div className="modal-field">
                      <label>
                        Clinical Specialty
                        <span className="modal-field-hint">e.g. Endodontics</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Orthodontics, Implantology, Pedodontics"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        className="modal-input"
                      />
                    </div>
                    <div className="modal-field">
                      <label>
                        Commission Rate (%)
                        <span className="modal-field-hint">Production incentive</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 35"
                        value={newCommission}
                        onChange={(e) => setNewCommission(e.target.value)}
                        className="modal-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="modal-field">
                    <label>
                      Practice Assignment / Role
                      <span className="modal-field-hint">Operational duty</span>
                    </label>
                    <select
                      value={newSupportRole}
                      onChange={(e) => setNewSupportRole(e.target.value)}
                      className="modal-select"
                    >
                      <option>Receptionist</option>
                      <option>Head Receptionist</option>
                      <option>Dental Assistant</option>
                      <option>Sterilisation Tech</option>
                      <option>Practice Administrator</option>
                    </select>
                  </div>
                )}

                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>
                      Phone Number
                      <span className="modal-field-hint">Direct line</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +20 100 234 5678"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Email Address
                      <span className="modal-field-hint">Practice communication</span>
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. dr.hisham@northline.clinic"
                      className="modal-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Add to practice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
