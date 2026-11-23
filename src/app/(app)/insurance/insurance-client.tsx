"use client";

import { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/demo-data";
import { createInsuranceClaim, approveInsuranceClaim } from "./actions";
import { InsuranceClaim } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CLAIM_FILTERS = ["All", "submitted", "approved", "partial", "rejected", "draft"];

export function InsuranceClient({
  initialClaims,
  patients,
}: {
  initialClaims: InsuranceClaim[];
  patients: Array<{ id: string; name: string }>;
}) {
  const [claims, setClaims] = useState<InsuranceClaim[]>(initialClaims);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New claim form state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || "");
  const [newInsurer, setNewInsurer] = useState("Misr Insurance");
  const [newMemberId, setNewMemberId] = useState("MI-99881122");
  const [newAmount, setNewAmount] = useState("450");
  const [newNotes, setNewNotes] = useState("");

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchSearch =
        c.patientName.toLowerCase().includes(search.toLowerCase()) ||
        c.insurance.toLowerCase().includes(search.toLowerCase()) ||
        c.claimNo.toLowerCase().includes(search.toLowerCase()) ||
        (c.memberId && c.memberId.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        statusFilter === "All" ||
        c.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [claims, search, statusFilter]);

  const approvedTotal = useMemo(
    () => claims.filter((c) => c.status === "approved").reduce((s, c) => s + (parseFloat(c.approvedAmount || c.amount) || 0), 0),
    [claims]
  );
  const pendingTotal = useMemo(
    () => claims.filter((c) => c.status === "submitted" || c.status === "pending").reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
    [claims]
  );
  const rejectedCount = useMemo(
    () => claims.filter((c) => c.status === "rejected" || c.status === "draft").length,
    [claims]
  );

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("patientId", newPatientId);
    fd.append("insurance", newInsurer);
    fd.append("memberId", newMemberId);
    fd.append("amount", newAmount);
    fd.append("notes", newNotes);

    try {
      const res = await createInsuranceClaim(fd);
      if (res.ok && res.data) {
        setClaims([res.data as InsuranceClaim, ...claims]);
        setIsModalOpen(false);
        setNewNotes("");
      }
    } catch (err) {
      alert("Failed to submit claim: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      const res = await approveInsuranceClaim(claimId);
      if (res.ok && res.data) {
        setClaims((prev) =>
          prev.map((c) => (c.id === claimId ? (res.data as InsuranceClaim) : c))
        );
      }
    } catch (err) {
      alert("Failed to approve claim: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="insurance-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Third-Party Payers</span>
          </div>
          <h1>Insurance &amp; Claims</h1>
          <p className="page-header-sub">{claims.length} claims on file · Pre-authorizations and electronic submissions synced to Supabase</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-primary" onClick={() => setIsModalOpen(true)}>
            <span>New claim</span> <ArrowUpRight />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Claims", value: String(claims.length), sub: "Submitted files", isDanger: false },
          { label: "Approved Payouts", value: `EGP ${formatCurrency(approvedTotal)}`, sub: "Cleared funds", isDanger: false },
          { label: "Pending Adjudication", value: `EGP ${formatCurrency(pendingTotal)}`, sub: "Under insurer review", isDanger: false },
          { label: "Rejected / Drafts", value: String(rejectedCount), sub: "Needs revision", isDanger: rejectedCount > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className={`kpi-card ${kpi.isDanger ? "kpi-card-danger" : ""}`}>
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--clinic-muted)", marginTop: "0.2rem" }}>
              {kpi.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Bar with Search and Chips */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by claim #, patient, insurer, or member ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <div className="filter-chips">
          {CLAIM_FILTERS.map((st) => (
            <button
              type="button"
              key={st}
              className={`filter-chip ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === "All" ? "All Claims" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Patient</th>
              <th>Insurance Provider</th>
              <th>Policy / Member ID</th>
              <th>Submitted</th>
              <th>Claimed (EGP)</th>
              <th>Approved (EGP)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 650, fontFamily: "var(--font-geist-mono)" }}>{c.claimNo}</td>
                <td style={{ fontWeight: 600 }}>{c.patientName}</td>
                <td>
                  <span className="insurance-pill">{c.insurance}</span>
                </td>
                <td style={{ fontFamily: "var(--font-geist-mono)" }}>{c.memberId || "—"}</td>
                <td>{formatDate(c.submittedDate || "")}</td>
                <td style={{ fontFamily: "var(--font-geist-mono)" }}>EGP {formatCurrency(parseFloat(c.amount) || 0)}</td>
                <td style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600, color: "var(--clinic-teal)" }}>
                  {c.approvedAmount ? `EGP ${formatCurrency(parseFloat(c.approvedAmount) || 0)}` : "—"}
                </td>
                <td>
                  <span className={`badge badge-claim-${c.status}`}>{c.status}</span>
                </td>
                <td>
                  {c.status !== "approved" && (
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem", minHeight: "28px" }}
                      onClick={() => handleApproveClaim(c.id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Claim Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Direct Billing Adjudication</span>
                <h2>Submit New Insurance Claim</h2>
                <p>Register electronic pre-authorization or reimbursement claim file</p>
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
            <form onSubmit={handleCreateClaim} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>
                    Select Patient
                    <span className="modal-field-hint">Primary Insured</span>
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

                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>
                      Insurance Carrier
                      <span className="modal-field-hint">Payor name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AXA Egypt, GlobeMed, Bupa"
                      value={newInsurer}
                      onChange={(e) => setNewInsurer(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Member / Policy Card ID
                      <span className="modal-field-hint">Identification #</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AXA-8849-EG"
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>
                    Claim Amount (EGP)
                    <span className="modal-field-hint">Total requested from insurer</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5200"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    Coverage &amp; Pre-authorization Notes
                    <span className="modal-field-hint">Approval codes, deductibles, co-pay %</span>
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="modal-textarea"
                    rows={2}
                    placeholder="Pre-authorization ref code, 20% patient co-pay applied, x-rays attached..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
