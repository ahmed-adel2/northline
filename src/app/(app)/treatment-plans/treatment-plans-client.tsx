"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/demo-data";
import { createTreatmentPlan, togglePlanItemStatus, recordPlanPayment, PlanItem } from "./actions";
import { TreatmentPlan } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface PatientOption {
  id: string;
  name: string;
  patientNo: number;
  phone: string;
}

export interface DoctorOption {
  id: string;
  name: string;
}

export function TreatmentPlansClient({
  initialPlans,
  patients,
  doctors,
}: {
  initialPlans: TreatmentPlan[];
  patients: PatientOption[];
  doctors: DoctorOption[];
}) {
  const [plans, setPlans] = useState<TreatmentPlan[]>(initialPlans);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<TreatmentPlan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("1000");
  const [submitting, setSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [expandedPlanIds, setExpandedPlanIds] = useState<Record<string, boolean>>({});

  const toggleExpandPlan = (planId: string) => {
    setExpandedPlanIds((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  // New plan state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || "");
  const [newDoctorId, setNewDoctorId] = useState(doctors[0]?.id || "");
  const [newProcedure, setNewProcedure] = useState("Crown (Zirconia)");
  const [newTooth, setNewTooth] = useState("16");
  const [newUnitPrice, setNewUnitPrice] = useState("3500");
  const [newNotes, setNewNotes] = useState("");

  const matchingPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query || selectedPatient) return [];

    return patients.filter((patient) => {
      const patientCode = `P-${String(patient.patientNo).padStart(3, "0")}`;
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query) ||
        patientCode.toLowerCase().includes(query) ||
        String(patient.patientNo).includes(query)
      );
    });
  }, [patientSearch, patients, selectedPatient]);

  const visiblePlans = useMemo(() => {
    if (!selectedPatient) return plans;

    return plans.filter(
      (plan) =>
        plan.patientId === selectedPatient.id ||
        (!plan.patientId && plan.patientName.toLowerCase() === selectedPatient.name.toLowerCase())
    );
  }, [plans, selectedPatient]);

  // Toggle procedure item status in DB
  const handleToggleItemStatus = async (planId: string, itemIdx: number) => {
    try {
      const res = await togglePlanItemStatus(planId, itemIdx);
      if (res.ok && res.data) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? (res.data as TreatmentPlan) : p))
        );
      }
    } catch (err) {
      alert("Failed to update status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Record payment in DB
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentPlan) return;
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;

    setSubmitting(true);
    try {
      const res = await recordPlanPayment(paymentPlan.id, amt);
      if (res.ok && res.data) {
        setPlans((prev) =>
          prev.map((p) => (p.id === paymentPlan.id ? (res.data as TreatmentPlan) : p))
        );
        setPaymentPlan(null);
        setPaymentAmount("1000");
      }
    } catch (err) {
      alert("Failed to record payment: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // Create new plan in DB
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("patientId", newPatientId);
    fd.append("doctorId", newDoctorId);
    fd.append("procedure", newProcedure);
    fd.append("tooth", newTooth);
    fd.append("unitPrice", newUnitPrice);
    fd.append("notes", newNotes);

    try {
      const res = await createTreatmentPlan(fd);
      if (res.ok && res.data) {
        setPlans([res.data as TreatmentPlan, ...plans]);
        setIsNewPlanModalOpen(false);
        setNewNotes("");
      }
    } catch (err) {
      alert("Failed to create plan: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="treatment-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Comprehensive Care Plans</span>
          </div>
          <h1>Treatment Plans</h1>
          <p className="page-header-sub">Multi-phase dental restorations, staged appointments, and patient financial consent</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-primary" onClick={() => setIsNewPlanModalOpen(true)}>
            <span>New plan</span> <ArrowUpRight />
          </button>
        </div>
      </div>

      <section className="card treatment-patient-search" aria-labelledby="treatment-patient-search-title">
        <div className="treatment-patient-search-heading">
          <div>
            <h2 id="treatment-patient-search-title">Find a patient’s treatment plans</h2>
            <p>Search active patient records by name, patient number, or phone.</p>
          </div>
          {selectedPatient && (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setSelectedPatient(null);
                setPatientSearch("");
              }}
            >
              View all plans
            </button>
          )}
        </div>

        <div className="treatment-patient-search-field">
          <label htmlFor="treatment-patient-search-input">Search patient records</label>
          <input
            id="treatment-patient-search-input"
            type="search"
            className="filter-search"
            value={patientSearch}
            onChange={(event) => {
              setPatientSearch(event.target.value);
              setSelectedPatient(null);
            }}
            placeholder="Name, patient number, or phone"
            autoComplete="off"
            aria-describedby="treatment-patient-search-help"
          />
          <p id="treatment-patient-search-help">Choose a patient to see their saved treatment plans.</p>
        </div>

        {selectedPatient ? (
          <div className="treatment-patient-selection" aria-live="polite">
            <div>
              <strong>{selectedPatient.name}</strong>
              <span>
                P-{String(selectedPatient.patientNo).padStart(3, "0")} · {selectedPatient.phone}
              </span>
            </div>
            <span className="treatment-patient-plan-count">
              {visiblePlans.length} {visiblePlans.length === 1 ? "plan" : "plans"}
            </span>
          </div>
        ) : patientSearch.trim() ? (
          <>
            <p className="treatment-patient-search-status" aria-live="polite">
              {matchingPatients.length === 0
                ? "No active patients match that search. Try another name, number, or phone."
                : `${matchingPatients.length > 8 ? "Showing the first 8 of " : ""}${matchingPatients.length} ${matchingPatients.length === 1 ? "patient" : "patients"}. Select one to view their plans.`}
            </p>
            {matchingPatients.length > 0 && (
              <ul className="treatment-patient-results" aria-label="Matching patients">
                {matchingPatients.slice(0, 8).map((patient) => (
                  <li key={patient.id}>
                    <button
                      type="button"
                      className="treatment-patient-result"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setPatientSearch(patient.name);
                        setNewPatientId(patient.id);
                      }}
                    >
                      <span className="patient-avatar-mini" aria-hidden="true">
                        {patient.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="treatment-patient-result-copy">
                        <strong>{patient.name}</strong>
                        <span>
                          P-{String(patient.patientNo).padStart(3, "0")} · {patient.phone}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </section>
      <div>
        {visiblePlans.length === 0 ? (
          <div className="treatment-plan-empty" aria-live="polite">
            <p>
              {selectedPatient
                ? `No treatment plans are saved for ${selectedPatient.name} yet.`
                : "No treatment plans are saved yet."}
            </p>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                if (selectedPatient) setNewPatientId(selectedPatient.id);
                setIsNewPlanModalOpen(true);
              }}
            >
              {selectedPatient ? `Create a plan for ${selectedPatient.name}` : "Create the first plan"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {visiblePlans.map((plan) => {
              const totalNum = parseFloat(plan.totalAmount) || 0;
              const paidNum = parseFloat(plan.paidAmount) || 0;
              const pct = totalNum > 0 ? Math.round((paidNum / totalNum) * 100) : 0;
              const items = (plan.items as PlanItem[]) || [];
              const isExpanded = !!expandedPlanIds[plan.id];

              return (
                <div
                  key={plan.id}
                  className={`card treatment-plan-card ${isExpanded ? "treatment-plan-card-active" : ""}`}
                  style={{ padding: "1.5rem 1.75rem" }}
                >
                  <div
                    className="treatment-plan-summary"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1.5rem",
                    }}
                  >
                    <div className="treatment-plan-meta" style={{ flex: "1 1 260px", minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span className="patient-id">{plan.planNo}</span>
                        <span className={`badge badge-plan-${plan.status}`}>{plan.status}</span>
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.45rem", color: "var(--clinic-ink)" }}>
                        {plan.patientName}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--clinic-muted)", marginTop: "0.2rem" }}>
                        {plan.doctorName} · {items.length} {items.length === 1 ? "procedure" : "procedures"}
                        {items[0]?.procedure ? ` (${items[0].procedure}${items.length > 1 ? ` +${items.length - 1} more` : ""})` : ""}
                      </div>
                    </div>

                    <div className="treatment-plan-payment" style={{ flex: "1 1 220px", maxWidth: "360px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.4rem", gap: "0.75rem" }}>
                        <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 700, color: "var(--clinic-ink)" }}>
                          {pct}% paid
                        </span>
                        <span style={{ color: "var(--clinic-muted)", fontFamily: "var(--font-geist-mono)" }}>
                          EGP {formatCurrency(paidNum)} / {formatCurrency(totalNum)}
                        </span>
                      </div>
                      <div className="progress-bar-track" style={{ height: "8px" }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="treatment-plan-actions" style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className={"button button-primary"}
                        style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem", minHeight: "38px" }}
                        onClick={() => toggleExpandPlan(plan.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Hide procedures" : `View procedures (${items.length})`}
                      </button>
                      {paidNum < totalNum && (
                        <button
                          type="button"
                          className="button button-secondary"
                          style={{ fontSize: "0.8rem", padding: "0.45rem 0.9rem", minHeight: "38px" }}
                          onClick={() => {
                            setPaymentPlan(plan);
                            setPaymentAmount(String(totalNum - paidNum));
                          }}
                        >
                          Record payment
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="treatment-details-panel" style={{ marginTop: "1.25rem", padding: "1.25rem 1.5rem" }}>
                      <div className="treatment-details-label">Staged Procedures</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "0.75rem",
                              flexWrap: "wrap",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "8px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0, flex: "1 1 200px" }}>
                              {item.tooth ? <span className="tooth-badge">{item.tooth}</span> : <span style={{ color: "var(--clinic-muted)", fontSize: "0.8rem", width: "26px", textAlign: "center" }}>—</span>}
                              <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--clinic-ink)" }}>{item.procedure}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexShrink: 0 }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--clinic-muted)", fontFamily: "var(--font-geist-mono)", fontVariantNumeric: "tabular-nums" }}>
                                {item.quantity} × EGP {formatCurrency(item.unitPrice)}
                              </span>
                              <button
                                type="button"
                                className={`badge badge-${item.status}`}
                                style={{ cursor: "pointer", border: "1px solid" }}
                                onClick={() => handleToggleItemStatus(plan.id, idx)}
                                title="Click to advance status"
                              >
                                {item.status} ↺
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {plan.notes && (
                        <div className="treatment-details-notes">
                          <strong>Clinical Notes:</strong> {plan.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Plan Modal */}
      {isNewPlanModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewPlanModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Comprehensive Clinical Plan</span>
                <h2>New Treatment Plan</h2>
                <p>Formulate staged procedures, teeth mapping, and financial agreement</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsNewPlanModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePlan} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>
                      Patient
                      <span className="modal-field-hint">Required</span>
                    </label>
                    <select
                      value={newPatientId}
                      onChange={(e) => setNewPatientId(e.target.value)}
                      className="modal-select"
                      required
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>
                      Attending Dentist
                      <span className="modal-field-hint">Clinical Lead</span>
                    </label>
                    <select
                      value={newDoctorId}
                      onChange={(e) => setNewDoctorId(e.target.value)}
                      className="modal-select"
                      required
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>
                      Primary Procedure
                      <span className="modal-field-hint">e.g. Root Canal, Crown</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProcedure}
                      onChange={(e) => setNewProcedure(e.target.value)}
                      className="modal-input"
                      placeholder="e.g. Ceramic Crown / Endodontic Treatment"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Tooth # (FDI Notation)
                      <span className="modal-field-hint">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={newTooth}
                      onChange={(e) => setNewTooth(e.target.value)}
                      placeholder="e.g. 16, 26, Upper Arch"
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>
                    Estimated Procedure Fee (EGP)
                    <span className="modal-field-hint">Total gross before discounts</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(e.target.value)}
                    className="modal-input"
                    placeholder="e.g. 4500"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    Clinical &amp; Financial Notes
                    <span className="modal-field-hint">Milestones, consent, scheduling</span>
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="modal-textarea"
                    rows={3}
                    placeholder="Phase sequencing, scheduled milestones, financial consent..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setIsNewPlanModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentPlan && (
        <div className="modal-backdrop" onClick={() => setPaymentPlan(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Billing Settlement</span>
                <h2>Record Plan Payment</h2>
                <p>Apply installment towards plan {paymentPlan.planNo}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPaymentPlan(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordPayment} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-info-banner">
                  <span>Patient: <strong>{paymentPlan.patientName}</strong> · Remaining: <strong>EGP {formatCurrency(parseFloat(paymentPlan.totalAmount) - parseFloat(paymentPlan.paidAmount))}</strong></span>
                </div>

                <div className="modal-field">
                  <label>
                    Payment Amount (EGP)
                    <span className="modal-field-hint">Current collection</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setPaymentPlan(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Confirming..." : "Apply Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
