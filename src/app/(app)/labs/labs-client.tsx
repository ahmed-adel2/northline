"use client";

import { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/demo-data";
import { createLabOrder, advanceLabStatus } from "./actions";
import { LabOrder } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const statusOrder = ["sent", "in-production", "shipped", "received", "delivered"];

export function LabsClient({
  initialOrders,
  patients,
  doctors,
}: {
  initialOrders: LabOrder[];
  patients: Array<{ id: string; name: string }>;
  doctors: Array<{ id: string; name: string }>;
}) {
  const [orders, setOrders] = useState<LabOrder[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New order form state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || "");
  const [newDoctorId, setNewDoctorId] = useState(doctors[0]?.id || "");
  const [newLabName, setNewLabName] = useState("Cairo Ceramics Lab");
  const [newWorkType, setNewWorkType] = useState("Zirconia Crown");
  const [newTooth, setNewTooth] = useState("16");
  const [newExpectedDate, setNewExpectedDate] = useState("2026-12-10");
  const [newCost, setNewCost] = useState("1200");
  const [newNotes, setNewNotes] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      return (
        o.patientName.toLowerCase().includes(search.toLowerCase()) ||
        o.labName.toLowerCase().includes(search.toLowerCase()) ||
        o.workType.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNo.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [orders, search]);

  const inProgress = useMemo(() => orders.filter((l) => !["delivered", "rejected"].includes(l.status)), [orders]);
  const completed = useMemo(() => orders.filter((l) => ["delivered", "rejected"].includes(l.status)), [orders]);
  const totalSpend = useMemo(() => orders.reduce((s, l) => s + (parseFloat(l.cost) || 0), 0), [orders]);

  // Advance lifecycle in DB
  const handleAdvanceStep = async (orderId: string, currentStatus: string) => {
    const currIdx = statusOrder.indexOf(currentStatus);
    if (currIdx >= 0 && currIdx < statusOrder.length - 1) {
      const nextStatus = statusOrder[currIdx + 1];
      try {
        const res = await advanceLabStatus(orderId, nextStatus);
        if (res.ok && res.data) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? (res.data as LabOrder) : o))
          );
        }
      } catch (err) {
        alert("Failed to advance order: " + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Create Order in DB
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("patientId", newPatientId);
    fd.append("doctorId", newDoctorId);
    fd.append("labName", newLabName);
    fd.append("workType", newWorkType);
    fd.append("tooth", newTooth);
    fd.append("expectedDate", newExpectedDate);
    fd.append("cost", newCost);
    fd.append("notes", newNotes);

    try {
      const res = await createLabOrder(fd);
      if (res.ok && res.data) {
        setOrders([res.data as LabOrder, ...orders]);
        setIsModalOpen(false);
        setNewNotes("");
      }
    } catch (err) {
      alert("Failed to create lab order: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="labs-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Dental Laboratory Tracking</span>
          </div>
          <h1>Lab Work Orders</h1>
          <p className="page-header-sub">{orders.length} total orders · {inProgress.length} active in fabrication · Synced to Supabase database</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-primary" onClick={() => setIsModalOpen(true)}>
            <span>New lab order</span> <ArrowUpRight />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total orders", value: String(orders.length) },
          { label: "In production", value: String(orders.filter((l) => l.status === "in-production").length) },
          { label: "Completed / delivered", value: String(completed.length) },
          { label: "Total lab spend", value: `EGP ${formatCurrency(totalSpend)}` },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by order ID, patient, lab partner, or restoration..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
      </div>

      {/* Orders Table */}
      <div className="table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Patient</th>
              <th>Restoration / Work Type</th>
              <th>Tooth</th>
              <th>Laboratory</th>
              <th>Sent date</th>
              <th>Expected</th>
              <th>Fee</th>
              <th>Status (click to advance)</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => {
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 650 }}>{o.orderNo}</td>
                  <td style={{ fontWeight: 600 }}>{o.patientName}</td>
                  <td>{o.workType}</td>
                  <td>{o.tooth ? <span className="tooth-badge">{o.tooth}</span> : "—"}</td>
                  <td>{o.labName}</td>
                  <td>{formatDate(o.sentDate)}</td>
                  <td>{formatDate(o.expectedDate)}</td>
                  <td>EGP {formatCurrency(parseFloat(o.cost) || 0)}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge badge-${o.status}`}
                      style={{ cursor: "pointer", border: "1px solid" }}
                      onClick={() => handleAdvanceStep(o.id, o.status)}
                      title="Click to advance lifecycle"
                    >
                      {o.status} ↺
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Active Lifecycle Tracker Widget */}
      {inProgress.length > 0 && (
        <section style={{ marginTop: "1.75rem" }}>
          <h2 className="section-heading">Active Orders Fabrication Pipeline</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {inProgress.map((order) => {
              const currIdx = statusOrder.indexOf(order.status);
              return (
                <div key={order.id} className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontWeight: 700, marginRight: "0.5rem" }}>{order.orderNo}</span>
                      <span style={{ color: "var(--clinic-muted)" }}>{order.patientName} · {order.workType} ({order.labName})</span>
                    </div>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </div>

                  <div className="lab-lifecycle">
                    {statusOrder.map((stepName, sIdx) => {
                      const isDone = currIdx > sIdx;
                      const isCurrent = currIdx === sIdx;
                      return (
                        <div
                          key={stepName}
                          className={`lifecycle-step ${isDone ? "lifecycle-done" : isCurrent ? "lifecycle-current" : ""}`}
                        >
                          <span className="lifecycle-dot" />
                          <span className="lifecycle-label">{stepName}</span>
                          {sIdx < statusOrder.length - 1 && (
                            <span className={`lifecycle-line ${isDone ? "lifecycle-line-done" : ""}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* New Lab Order Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Laboratory Prescription</span>
                <h2>New Lab Work Order</h2>
                <p>Send prosthesis, crown, or orthodontic appliance for fabrication</p>
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
            <form onSubmit={handleCreateOrder} style={{ display: "contents" }}>
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
                      Dentist
                      <span className="modal-field-hint">Prescriber</span>
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
                      Laboratory Partner
                      <span className="modal-field-hint">Fabricator</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Dental Lab, Cairo Dental Lab"
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Work / Restoration Type
                      <span className="modal-field-hint">e.g. Zirconia Crown</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. E-Max Veneer, Zirconia Crown"
                      value={newWorkType}
                      onChange={(e) => setNewWorkType(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>
                      Tooth # (FDI)
                      <span className="modal-field-hint">Location</span>
                    </label>
                    <input
                      type="text"
                      value={newTooth}
                      onChange={(e) => setNewTooth(e.target.value)}
                      placeholder="e.g. 21, 22 or Arch"
                      className="modal-input"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Lab Cost (EGP)
                      <span className="modal-field-hint">Lab expense</span>
                    </label>
                    <input
                      type="number"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      placeholder="e.g. 1800"
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>
                    Expected Delivery Date
                    <span className="modal-field-hint">Fit appointment target</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpectedDate}
                    onChange={(e) => setNewExpectedDate(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    Fabrication Instructions &amp; Shade
                    <span className="modal-field-hint">Color guide &amp; margin specs</span>
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="modal-textarea"
                    rows={2}
                    placeholder="Shade guide (e.g. VITA A2), margin preparation, translucency gradient..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Submit to Lab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
