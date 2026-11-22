import Link from "next/link";
import "@/app/(app)/internal.css";
import { demoPatients, formatDate, formatCurrency } from "@/lib/demo-data";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Patients() {
  return (
    <div className="patients-wrap">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>
            {demoPatients.length} records · synthetic demo data
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="button button-secondary">
            Export
          </button>
          <Link href="/patients/new" className="button button-primary">
            New patient <ArrowUpRight />
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input type="search" className="filter-search" placeholder="Search by name, phone, ID…" aria-label="Search patients" />
        <div className="filter-chips">
          <button className="filter-chip filter-chip-active">All ({demoPatients.length})</button>
          <button className="filter-chip">Active ({demoPatients.filter((p) => p.status === "active").length})</button>
          <button className="filter-chip">Overdue ({demoPatients.filter((p) => p.status === "overdue").length})</button>
          <button className="filter-chip">Inactive ({demoPatients.filter((p) => p.status === "inactive").length})</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table" aria-label="Patient list">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">DOB</th>
              <th scope="col">Phone</th>
              <th scope="col">Insurance</th>
              <th scope="col">Last visit</th>
              <th scope="col">Next appt</th>
              <th scope="col" style={{ textAlign: "right" }}>Balance</th>
              <th scope="col">Status</th>
              <th scope="col" className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoPatients.map((p) => (
              <tr key={p.id} className="patient-row">
                <td data-label="ID" className="patient-id">{p.id}</td>
                <td data-label="Name">
                  <Link href={`/patients/${p.id}`} className="patient-name">
                    {p.name}
                  </Link>
                </td>
                <td data-label="DOB" className="numeric">{formatDate(p.dob)}</td>
                <td data-label="Phone" className="numeric">{p.phone}</td>
                <td data-label="Insurance">
                  {p.insurance ? (
                    <span className="insurance-pill">{p.insurance}</span>
                  ) : (
                    <span style={{ color: "var(--clinic-muted)", fontSize: "0.78rem" }}>—</span>
                  )}
                </td>
                <td data-label="Last visit" className="numeric">{formatDate(p.lastVisit)}</td>
                <td data-label="Next appt" className="numeric">{p.nextAppt ? formatDate(p.nextAppt) : "—"}</td>
                <td data-label="Balance" className="numeric" style={{ textAlign: "right" }}>
                  {p.balance < 0 ? (
                    <span style={{ color: "var(--clinic-danger)", fontVariantNumeric: "tabular-nums" }}>
                      EGP {formatCurrency(p.balance)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--clinic-muted)" }}>—</span>
                  )}
                </td>
                <td data-label="Status">
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </td>
                <td data-label="Actions" className="actions">
                  <Link href={`/patients/${p.id}`} className="icon-link" aria-label={`View ${p.name}`}>
                    View <ArrowUpRight />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
