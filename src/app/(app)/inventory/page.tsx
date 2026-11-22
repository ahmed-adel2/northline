import "@/app/(app)/internal.css";
import { demoInventory, formatDate, formatCurrency } from "@/lib/demo-data";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Inventory() {
  const lowStock = demoInventory.filter((i) => i.status === "low" || i.status === "out-of-stock");
  const totalValue = demoInventory.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  return (
    <div className="inventory-wrap">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>{demoInventory.length} items · {lowStock.length} require attention · synthetic demo data</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="button" className="button button-secondary">Stock order</button>
          <button type="button" className="button button-primary">Add item <ArrowUpRight /></button>
        </div>
      </div>

      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: "1.25rem" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>
            <strong>{lowStock.length} items</strong> are low or out of stock and require a restock order.
          </span>
        </div>
      )}

      {/* KPI strip */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total SKUs", value: String(demoInventory.length) },
          { label: "Low / out of stock", value: String(lowStock.length), danger: true },
          { label: "In stock", value: String(demoInventory.filter((i) => i.status === "in-stock").length) },
          { label: "Est. stock value", value: `EGP ${formatCurrency(totalValue)}` },
        ].map((kpi) => (
          <div key={kpi.label} className={`kpi-card${kpi.danger && lowStock.length > 0 ? " kpi-card-danger" : ""}`}>
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value" style={{ fontSize: "1.5rem" }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table" aria-label="Inventory list">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Item</th>
              <th scope="col">Category</th>
              <th scope="col">Unit</th>
              <th scope="col" style={{ textAlign: "right" }}>Qty</th>
              <th scope="col" style={{ textAlign: "right" }}>Min</th>
              <th scope="col" style={{ textAlign: "right" }}>Unit cost</th>
              <th scope="col">Supplier</th>
              <th scope="col">Last restocked</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoInventory.map((item) => (
              <tr key={item.id} className={item.status === "out-of-stock" ? "row-danger" : item.status === "low" ? "row-warning" : ""}>
                <td className="patient-id">{item.id}</td>
                <td>
                  <div>
                    <span style={{ display: "block", fontWeight: 550, fontSize: "0.85rem" }}>{item.name}</span>
                    {item.linkedProcedures.length > 0 && (
                      <span style={{ display: "block", color: "var(--clinic-muted)", fontSize: "0.72rem" }}>
                        Used in: {item.linkedProcedures.join(", ")}
                      </span>
                    )}
                  </div>
                </td>
                <td><span className="badge badge-category">{item.category}</span></td>
                <td style={{ fontSize: "0.82rem", color: "var(--clinic-muted)" }}>{item.unit}</td>
                <td className="numeric" style={{ textAlign: "right", fontWeight: 600, color: item.quantity === 0 ? "var(--clinic-danger)" : item.quantity <= item.minQuantity ? "var(--clinic-warning)" : "inherit" }}>
                  {item.quantity}
                </td>
                <td className="numeric" style={{ textAlign: "right", color: "var(--clinic-muted)" }}>{item.minQuantity}</td>
                <td className="numeric" style={{ textAlign: "right" }}>EGP {formatCurrency(item.unitCost)}</td>
                <td style={{ fontSize: "0.78rem" }}>{item.supplier}</td>
                <td className="numeric">{formatDate(item.lastRestocked)}</td>
                <td><span className={`badge badge-stock-${item.status.replace(/-/g, "")}`}>{item.status.replace(/-/g, " ")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
