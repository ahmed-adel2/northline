"use client";

import { useState } from "react";
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

  // New plan state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || "");
  const [newDoctorId, setNewDoctorId] = useState(doctors[0]?.id || "");
  const [newProcedure, setNewProcedure] = useState("Crown (Zirconia)");
  const [newTooth, setNewTooth] = useState("16");
  const [newUnitPrice, setNewUnitPrice] = useState("3500");
  const [newNotes, setNewNotes] = useState("");

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

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {plans.map((plan) => {
          const totalNum = parseFloat(plan.totalAmount) || 0;
          const paidNum = parseFloat(plan.paidAmount) || 0;
          const pct = totalNum > 0 ? Math.round((paidNum / totalNum) * 100) : 0;
          const items = (plan.items as PlanItem[]) || [];

          return (
            <div key={plan.id} className="card treatment-plan-card">
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span className="patient-id">{plan.planNo}</span>
                  <span className="patient-name" style={{ fontSize: "1rem", fontWeight: 700 }}>
                    {plan.patientName}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--clinic-muted)" }}>{plan.doctorName}</span>
                  <span className={`badge badge-plan-${plan.status}`}>{plan.status}</span>
                  {paidNum < totalNum && (
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem", minHeight: "32px" }}
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

              <div className="plan-body">
                {/* Items table */}
                <table className="plan-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: "65px" }}>Tooth</th>
                      <th>Procedure</th>
                      <th>Qty</th>
                      <th>Unit price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.tooth ? <span className="tooth-badge">{item.tooth}</span> : "—"}</td>
                        <td style={{ fontWeight: 550 }}>{item.procedure}</td>
                        <td>{item.quantity}</td>
                        <td>EGP {formatCurrency(item.unitPrice)}</td>
                        <td>
                          <button
                            type="button"
                            className={`badge badge-${item.status}`}
                            style={{ cursor: "pointer", border: "1px solid" }}
                            onClick={() => handleToggleItemStatus(plan.id, idx)}
                            title="Click to advance status"
                          >
                            {item.status} ↺
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial consent strip */}
                <div className="plan-progress">
                  <div className="plan-progress-wrap">
                    <div className="progress-bar-label">
                      <span style={{ fontWeight: 650, color: "var(--clinic-ink)" }}>Payment progress</span>
                      <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600 }}>
                        {pct}% (EGP {formatCurrency(paidNum)} of EGP {formatCurrency(totalNum)})
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {plan.notes && <p className="plan-notes" style={{ margin: "0.6rem 0 0", fontSize: "0.8rem", color: "var(--clinic-muted)" }}>{plan.notes}</p>}
                </div>
              </div>
            </div>
          );
        })}
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
