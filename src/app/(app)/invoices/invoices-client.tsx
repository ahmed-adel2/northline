"use client";

import { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/demo-data";
import { createInvoice, recordInvoicePayment, logReportExport } from "./actions";
import { Invoice } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_FILTERS = ["All", "issued", "paid", "partial", "overdue", "draft"];

export function InvoicesClient({
  initialInvoices,
  patients,
}: {
  initialInvoices: Invoice[];
  patients: Array<{ id: string; name: string }>;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submitting, setSubmitting] = useState(false);

  // New invoice form state
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || "");
  const [newSubtotal, setNewSubtotal] = useState("500");
  const [newDueDate, setNewDueDate] = useState("2026-12-15");
  const [newInsurance, setNewInsurance] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        (inv.insurance && inv.insurance.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        statusFilter === "All" ||
        inv.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalRevenue = useMemo(
    () => invoices.reduce((s, i) => s + (parseFloat(i.total) || 0), 0),
    [invoices]
  );
  const totalCollected = useMemo(
    () => invoices.reduce((s, i) => s + (parseFloat(i.paid) || 0), 0),
    [invoices]
  );
  const totalOutstanding = useMemo(
    () => invoices.reduce((s, i) => s + (parseFloat(i.balance) || 0), 0),
    [invoices]
  );
  const overdueCount = useMemo(
    () => invoices.filter((i) => i.status === "overdue").length,
    [invoices]
  );

  // Export report to CSV/Excel and log in database
  const handleExportCSV = async () => {
    try {
      await logReportExport("invoices_excel_sheet", `Filter: ${statusFilter}, Search: ${search}`);
    } catch (e) {
      console.warn("Audit log for export skipped:", e);
    }

    const headers = [
      "Invoice ID",
      "Patient Name",
      "Issue Date",
      "Due Date",
      "Insurance",
      "Subtotal",
      "Tax",
      "Total",
      "Paid",
      "Balance",
      "Status",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNo,
      `"${inv.patientName}"`,
      inv.issueDate,
      inv.dueDate,
      `"${inv.insurance || ""}"`,
      inv.subtotal,
      inv.tax,
      inv.total,
      inv.paid,
      inv.balance,
      inv.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Northline-Invoices-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create new invoice in DB
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("patientId", newPatientId);
    fd.append("subtotal", newSubtotal);
    fd.append("dueDate", newDueDate);
    fd.append("insurance", newInsurance);
    fd.append("notes", newNotes);

    try {
      const res = await createInvoice(fd);
      if (res.ok && res.data) {
        setInvoices([res.data as Invoice, ...invoices]);
        setIsModalOpen(false);
        setNewNotes("");
      }
    } catch (err) {
      alert("Failed to create invoice: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // Record payment in DB
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    const pmt = parseFloat(paymentAmount) || 0;
    if (pmt <= 0) return;

    setSubmitting(true);
    try {
      const res = await recordInvoicePayment(paymentModalInvoice.id, pmt, paymentMethod);
      if (res.ok && res.data) {
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === paymentModalInvoice.id ? (res.data as Invoice) : inv))
        );
        setPaymentModalInvoice(null);
        setPaymentAmount("");
      }
    } catch (err) {
      alert("Failed to confirm payment: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="invoices-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Billing &amp; Revenue Operations</span>
          </div>
          <h1>Invoices &amp; Payments</h1>
          <p className="page-header-sub">
            VAT-compliant patient bills, collections, payment plans, and insurance claims synced to Supabase
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-secondary" onClick={handleExportCSV}>
            <span>Export report to Excel / CSV</span>
          </button>
          <button type="button" className="button button-primary" onClick={() => setIsModalOpen(true)}>
            <span>New invoice</span> <ArrowUpRight />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total Billed", value: `EGP ${formatCurrency(totalRevenue)}`, sub: "All time invoices", isDanger: false },
          { label: "Total Collected", value: `EGP ${formatCurrency(totalCollected)}`, sub: "Confirmed payments", isDanger: false },
          { label: "Outstanding Balance", value: `EGP ${formatCurrency(totalOutstanding)}`, sub: "Receivables", isDanger: totalOutstanding > 0 },
          { label: "Overdue Invoices", value: String(overdueCount), sub: "Action required", isDanger: overdueCount > 0 },
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
          placeholder="Search by invoice #, patient, or insurer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <div className="filter-chips">
          {STATUS_FILTERS.map((st) => (
            <button
              type="button"
              key={st}
              className={`filter-chip ${statusFilter === st ? "active" : ""}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === "All" ? "All Invoices" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-wrap card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Issue date</th>
              <th>Due date</th>
              <th>Insurance</th>
              <th>Total (incl. 14% VAT)</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 650, fontFamily: "var(--font-geist-mono)" }}>{inv.invoiceNo}</td>
                <td style={{ fontWeight: 600 }}>{inv.patientName}</td>
                <td>{formatDate(inv.issueDate)}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td>
                  {inv.insurance ? (
                    <span className="insurance-pill">{inv.insurance}</span>
                  ) : (
                    <span style={{ color: "var(--clinic-muted)" }}>—</span>
                  )}
                </td>
                <td style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600 }}>EGP {formatCurrency(parseFloat(inv.total) || 0)}</td>
                <td style={{ fontFamily: "var(--font-geist-mono)", color: "var(--clinic-teal)", fontWeight: 600 }}>
                  EGP {formatCurrency(parseFloat(inv.paid) || 0)}
                </td>
                <td style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 700, color: parseFloat(inv.balance) > 0 ? "var(--clinic-danger)" : "inherit" }}>
                  EGP {formatCurrency(parseFloat(inv.balance) || 0)}
                </td>
                <td>
                  <span className={`badge badge-inv-${inv.status}`}>{inv.status}</span>
                </td>
                <td>
                  {parseFloat(inv.balance) > 0 && (
                    <button
                      type="button"
                      className="button button-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem", minHeight: "28px" }}
                      onClick={() => {
                        setPaymentModalInvoice(inv);
                        setPaymentAmount(inv.balance);
                      }}
                    >
                      Confirm payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Revenue &amp; Billing</span>
                <h2>Generate New Invoice</h2>
                <p>Issue an official clinical tax invoice with 14% VAT calculation</p>
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
            <form onSubmit={handleCreateInvoice} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>
                    Select Patient
                    <span className="modal-field-hint">Account holder</span>
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
                      Subtotal (EGP)
                      <span className="modal-field-hint">Before 14% VAT</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 3500"
                      value={newSubtotal}
                      onChange={(e) => setNewSubtotal(e.target.value)}
                      className="modal-input"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Payment Due Date
                      <span className="modal-field-hint">Settlement deadline</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-info-banner">
                  <span>
                    Gross Preview: <strong>EGP {formatCurrency(parseFloat(newSubtotal) || 0)}</strong> + 14% VAT (<strong>EGP {formatCurrency((parseFloat(newSubtotal) || 0) * 0.14)}</strong>) = Total <strong>EGP {formatCurrency((parseFloat(newSubtotal) || 0) * 1.14)}</strong>
                  </span>
                </div>

                <div className="modal-field">
                  <label>
                    Insurance Provider
                    <span className="modal-field-hint">Optional third-party payer</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AXA Egypt, Bupa, GlobeMed, MetLife"
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    Invoice Notes &amp; Payment Terms
                    <span className="modal-field-hint">Displayed on printed receipt</span>
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="modal-textarea"
                    rows={2}
                    placeholder="InstaPay transfer reference, installment breakdown, or discount note..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {paymentModalInvoice && (
        <div className="modal-backdrop" onClick={() => setPaymentModalInvoice(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Payment Collection</span>
                <h2>Record Payment for {paymentModalInvoice.invoiceNo}</h2>
                <p>Register transaction and deduct from remaining invoice balance</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPaymentModalInvoice(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRecordPayment} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-info-banner">
                  <span>Patient: <strong>{paymentModalInvoice.patientName}</strong> · Outstanding Balance: <strong>EGP {formatCurrency(parseFloat(paymentModalInvoice.balance) || 0)}</strong></span>
                </div>

                <div className="modal-field">
                  <label>
                    Amount Received (EGP)
                    <span className="modal-field-hint">Direct deposit</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    Payment Method
                    <span className="modal-field-hint">Channel</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="modal-select"
                  >
                    <option>Cash</option>
                    <option>Credit / Debit Card</option>
                    <option>Bank Transfer</option>
                    <option>InstaPay</option>
                    <option>Insurance Direct Pay</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setPaymentModalInvoice(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Confirm & Save to DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
