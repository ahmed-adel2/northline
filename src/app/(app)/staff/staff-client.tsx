"use client";

import { useState } from "react";
import {
  calculateMonthlyDoctorSalaries,
  createStaffMember,
  getMonthlyDoctorSalaries,
  toggleStaffStatus,
  updateStaffProfile,
} from "./actions";
import { DoctorMonthlySalary, Staff } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StaffClient({
  initialStaff,
  initialMonth,
  initialSalaries,
}: {
  initialStaff: Staff[];
  initialMonth: string;
  initialSalaries: DoctorMonthlySalary[];
}) {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [salaries, setSalaries] = useState<DoctorMonthlySalary[]>(initialSalaries);
  const [calculatingSalaries, setCalculatingSalaries] = useState(false);
  const [loadingSalaries, setLoadingSalaries] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newRoleType, setNewRoleType] = useState<"doctor" | "support">("doctor");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newSupportRole, setNewSupportRole] = useState("Dental Assistant");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("+20 100 ");
  const [newCommission, setNewCommission] = useState("35");
  const [publicTitle, setPublicTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [languages, setLanguages] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [bio, setBio] = useState("");
  const [philosophy, setPhilosophy] = useState("");

  const doctors = staffList.filter((s) => s.role === "dentist" || s.role === "owner");
  const supportPersonnel = staffList.filter((s) => s.role === "receptionist");

  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    setLoadingSalaries(true);
    try {
      const res = await getMonthlyDoctorSalaries(month);
      if (res.ok) {
        setSalaries(res.data);
      }
    } catch (err) {
      alert("Failed to load salaries: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoadingSalaries(false);
    }
  };

  const handleCalculateSalaries = async () => {
    setCalculatingSalaries(true);
    try {
      const res = await calculateMonthlyDoctorSalaries(selectedMonth);
      if (res.ok) {
        setSalaries(res.data);
      }
    } catch (err) {
      alert("Failed to calculate salaries: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCalculatingSalaries(false);
    }
  };

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

  const openAddModal = () => {
    setEditingStaffId(null);
    setNewName("");
    setNewRoleType("doctor");
    setNewSpecialty("");
    setNewSupportRole("Dental Assistant");
    setNewEmail("");
    setNewPhone("");
    setNewCommission("35");
    setPublicTitle("");
    setExperience("");
    setAvailability("");
    setLanguages("");
    setQualifications("");
    setBio("");
    setPhilosophy("");
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    const isDoctor = staff.role === "dentist" || staff.role === "owner";
    setEditingStaffId(staff.id);
    setNewName(staff.fullName);
    setNewRoleType(isDoctor ? "doctor" : "support");
    setNewSpecialty(staff.specialty ?? "");
    setNewSupportRole(staff.specialty ?? "Receptionist");
    setNewEmail(staff.email ?? "");
    setNewPhone(staff.phone ?? "");
    setNewCommission(staff.commissionRate ?? "0");
    setPublicTitle(staff.publicTitle ?? "");
    setExperience(staff.experience ?? "");
    setAvailability(staff.availability ?? "");
    setLanguages(staff.languages.join("\n"));
    setQualifications(staff.qualifications.join("\n"));
    setBio(staff.bio ?? "");
    setPhilosophy(staff.philosophy ?? "");
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    const fullName = editingStaffId || newRoleType !== "doctor" || newName.startsWith("Dr.")
      ? newName
      : `Dr. ${newName}`;
    fd.append("fullName", fullName);
    fd.append("roleType", newRoleType);
    fd.append("specialty", newSpecialty);
    fd.append("supportRole", newSupportRole);
    fd.append("email", newEmail || `${newName.toLowerCase().replace(/[^a-z]/g, "")}@northline.clinic`);
    fd.append("phone", newPhone);
    fd.append("commissionRate", newCommission);
    fd.append("publicTitle", publicTitle);
    fd.append("experience", experience);
    fd.append("availability", availability);
    fd.append("languages", languages);
    fd.append("qualifications", qualifications);
    fd.append("bio", bio);
    fd.append("philosophy", philosophy);

    try {
      const res = editingStaffId
        ? await updateStaffProfile(editingStaffId, fd)
        : await createStaffMember(fd);
      if (res.ok && res.data) {
        setStaffList((prev) =>
          editingStaffId
            ? prev.map((staff) => staff.id === editingStaffId ? res.data : staff)
            : [res.data, ...prev]
        );
        setIsModalOpen(false);
        setEditingStaffId(null);
      }
    } catch (err) {
      alert("Failed to save staff member: " + (err instanceof Error ? err.message : String(err)));
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
          <button type="button" className="button button-primary" onClick={openAddModal}>
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

                {doc.availability && (
                  <div className="team-schedule">
                    <span className="team-facts-label">Public Availability</span>
                    <p>{doc.availability}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => openEditModal(doc)}
                >
                  Edit public profile
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Staff */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2 className="section-heading">Support &amp; Administrative Personnel</h2>
        <div className="team-grid">
          {supportPersonnel.map((staff) => {
            const color = staff.color || "#087f80";
            const initials = staff.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2);
            return (
              <div key={staff.id} className="team-card card">
                <div className="team-card-header">
                  <div className="team-avatar" style={{ background: color + "22", color }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="team-name">{staff.fullName}</span>
                    <span className="team-specialty">{staff.specialty || "Receptionist"}</span>
                  </div>
                  <button
                    type="button"
                    className={`badge badge-${staff.active ? "active" : "inactive"}`}
                    style={{ marginLeft: "auto", cursor: "pointer", border: "1px solid" }}
                    onClick={() => handleToggleStatus(staff.id, staff.active)}
                    title="Click to toggle status"
                  >
                    {staff.active ? "active" : "inactive"} ↺
                  </button>
                </div>

                <dl className="team-facts">
                  <div>
                    <dt>Phone</dt>
                    <dd>{staff.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{staff.email || "—"}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd style={{ textTransform: "capitalize" }}>{staff.role}</dd>
                  </div>
                  <div>
                    <dt>Assignment</dt>
                    <dd>{staff.specialty || "Receptionist"}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => openEditModal(staff)}
                >
                  Edit profile
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly Doctor Salaries */}
      <section className="card analytics-table-card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2>Monthly Doctor Salaries</h2>
            <span style={{ fontSize: "0.75rem", color: "var(--clinic-muted)" }}>
              {selectedMonth} · {doctors.length} doctors
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              disabled={loadingSalaries || calculatingSalaries}
              aria-label="Select salary month"
            />
            <button
              type="button"
              className="button button-primary"
              onClick={handleCalculateSalaries}
              disabled={calculatingSalaries || loadingSalaries}
            >
              {calculatingSalaries ? "Calculating..." : "Calculate & Save Salaries"}
            </button>
          </div>
        </div>
        <div className="table-wrap" style={{ margin: 0, border: "none", borderRadius: 0 }}>
          <table className="data-table" aria-label="Monthly doctor salaries table">
            <thead>
              <tr>
                <th scope="col">Doctor</th>
                <th scope="col" style={{ textAlign: "right" }}>Commission</th>
                <th scope="col" style={{ textAlign: "right" }}>Completed Appts</th>
                <th scope="col" style={{ textAlign: "right" }}>Gross Revenue</th>
                <th scope="col" style={{ textAlign: "right" }}>Calculated Salary</th>
                <th scope="col" style={{ textAlign: "right" }}>Last Calculated</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => {
                const record = salaries.find((s) => s.doctorId === doc.id);
                return (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600 }}>{doc.fullName}</td>
                    <td className="numeric" style={{ textAlign: "right" }}>
                      {record ? `${record.commissionRate}%` : `${doc.commissionRate || "0"}%`}
                    </td>
                    <td className="numeric" style={{ textAlign: "right" }}>
                      {record ? record.appointmentsCount : "—"}
                    </td>
                    <td className="numeric" style={{ textAlign: "right", color: "var(--clinic-muted)" }}>
                      {record ? `EGP ${Number(record.grossRevenue).toLocaleString()}` : "—"}
                    </td>
                    <td className="numeric" style={{ textAlign: "right", fontWeight: 700, color: record ? "var(--clinic-success)" : "var(--clinic-muted)" }}>
                      {record ? `EGP ${Number(record.salaryAmount).toLocaleString()}` : "Not calculated"}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--clinic-muted)" }}>
                      {record ? new Date(record.calculatedAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                );
              })}
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
                <h2>{editingStaffId ? (newRoleType === "doctor" ? "Edit doctor profile" : "Edit staff profile") : "Add Practice Staff Member"}</h2>
                <p>
                  {editingStaffId
                    ? (newRoleType === "doctor"
                        ? "Manage the details shown on the public clinicians page."
                        : "Update support and administrative personnel details.")
                    : "Onboard clinical practitioners, specialists, and administrative personnel"}
                </p>
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
            <form onSubmit={handleSaveStaff} style={{ display: "contents" }}>
              <div className="modal-body">
                {!editingStaffId && (
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
                )}

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
                  <>
                    <div className="modal-grid-2">
                      <div className="modal-field">
                        <label>
                          Clinical Specialty
                          <span className="modal-field-hint">Shown as the area of focus</span>
                        </label>
                        <input
                          type="text"
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                          className="modal-input"
                        />
                      </div>
                      <div className="modal-field">
                        <label>
                          Public Title
                          <span className="modal-field-hint">Optional</span>
                        </label>
                        <input
                          type="text"
                          value={publicTitle}
                          onChange={(e) => setPublicTitle(e.target.value)}
                          className="modal-input"
                        />
                      </div>
                    </div>

                    {!editingStaffId && (
                      <div className="modal-grid-2">
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
                        <div className="modal-field">
                          <label>
                            Clinical Experience
                            <span className="modal-field-hint">Displayed as entered</span>
                          </label>
                          <input
                            type="text"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="modal-input"
                          />
                        </div>
                      </div>
                    )}

                    {editingStaffId && (
                      <div className="modal-field">
                        <label>
                          Clinical Experience
                          <span className="modal-field-hint">Displayed as entered</span>
                        </label>
                        <input
                          type="text"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="modal-input"
                        />
                      </div>
                    )}

                    <div className="modal-field">
                      <label>Availability</label>
                      <input
                        type="text"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="modal-input"
                      />
                    </div>

                    <div className="modal-grid-2">
                      <div className="modal-field">
                        <label>
                          Languages
                          <span className="modal-field-hint">One language per line</span>
                        </label>
                        <textarea
                          rows={3}
                          value={languages}
                          onChange={(e) => setLanguages(e.target.value)}
                          className="modal-textarea"
                        />
                      </div>
                      <div className="modal-field">
                        <label>
                          Qualifications
                          <span className="modal-field-hint">One credential per line</span>
                        </label>
                        <textarea
                          rows={3}
                          value={qualifications}
                          onChange={(e) => setQualifications(e.target.value)}
                          className="modal-textarea"
                        />
                      </div>
                    </div>

                    <div className="modal-field">
                      <label>Biography</label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="modal-textarea"
                      />
                    </div>

                    <div className="modal-field">
                      <label>Care Philosophy</label>
                      <textarea
                        rows={2}
                        value={philosophy}
                        onChange={(e) => setPhilosophy(e.target.value)}
                        className="modal-textarea"
                      />
                    </div>
                  </>
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
                <button type="button" className="button button-secondary" onClick={() => {
                  setIsModalOpen(false);
                  setEditingStaffId(null);
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting
                    ? "Saving to database..."
                    : editingStaffId ? "Save profile" : "Add to practice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
