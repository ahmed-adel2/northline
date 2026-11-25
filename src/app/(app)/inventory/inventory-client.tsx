"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/lib/demo-data";
import { addInventoryItem, restockInventoryItem } from "./actions";
import { InventoryItem } from "@/db";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CATEGORIES = ["All", "Restorative", "Hygiene", "Anaesthesia", "PPE", "Impressions", "Prosthetics", "Sterilisation"];

export function InventoryClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [inventoryScrollEdge, setInventoryScrollEdge] = useState<"none" | "start" | "end">("none");
  const inventoryTableWrapRef = useRef<HTMLDivElement>(null);

  // New item form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Restorative");
  const [newUnit, setNewUnit] = useState("syringe");
  const [newQty, setNewQty] = useState("10");
  const [newMinQty, setNewMinQty] = useState("5");
  const [newCost, setNewCost] = useState("150");
  const [newSupplier, setNewSupplier] = useState("Dentsply Sirona Egypt");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(search.toLowerCase())) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "All" ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [items, search, categoryFilter]);

  useEffect(() => {
    const tableWrap = inventoryTableWrapRef.current;
    if (!tableWrap) return;

    const updateScrollEdge = () => {
      const maxScrollLeft = tableWrap.scrollWidth - tableWrap.clientWidth;

      if (maxScrollLeft <= 1) {
        setInventoryScrollEdge("none");
      } else if (tableWrap.scrollLeft <= 1) {
        setInventoryScrollEdge("end");
      } else if (maxScrollLeft - tableWrap.scrollLeft <= 1) {
        setInventoryScrollEdge("start");
      } else {
        setInventoryScrollEdge("none");
      }
    };

    updateScrollEdge();
    tableWrap.addEventListener("scroll", updateScrollEdge, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollEdge);
    resizeObserver.observe(tableWrap);
    const table = tableWrap.querySelector("table");
    if (table) resizeObserver.observe(table);

    return () => {
      tableWrap.removeEventListener("scroll", updateScrollEdge);
      resizeObserver.disconnect();
    };
  }, [filteredItems.length]);
  const lowStock = useMemo(() => items.filter((i) => i.status === "low" || i.status === "out-of-stock"), [items]);
  const inStockCount = useMemo(() => items.filter((i) => i.status === "in-stock").length, [items]);
  const totalValue = useMemo(() => items.reduce((s, i) => s + i.quantity * (parseFloat(i.unitCost) || 0), 0), [items]);

  // Handle Add Item in DB
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", newName);
    fd.append("category", newCategory);
    fd.append("unit", newUnit);
    fd.append("quantity", newQty);
    fd.append("minQuantity", newMinQty);
    fd.append("unitCost", newCost);
    fd.append("supplier", newSupplier);

    try {
      const res = await addInventoryItem(fd);
      if (res.ok && res.data) {
        setItems([res.data as InventoryItem, ...items]);
        setIsAddModalOpen(false);
        setNewName("");
      }
    } catch (err) {
      alert("Failed to add inventory item: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Restock in DB
  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;
    const addQty = parseInt(restockQty, 10) || 0;
    if (addQty <= 0) return;

    setSubmitting(true);
    try {
      const res = await restockInventoryItem(restockModalItem.id, addQty);
      if (res.ok && res.data) {
        setItems((prev) =>
          prev.map((i) => (i.id === restockModalItem.id ? (res.data as InventoryItem) : i))
        );
        setRestockModalItem(null);
        setRestockQty("10");
      }
    } catch (err) {
      alert("Failed to restock item: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inventory-wrap">
      <div className="page-header">
        <div>
          <div className="page-header-tag">
            <span>Stock &amp; Sterilization Supplies</span>
          </div>
          <h1>Dental Inventory</h1>
          <p className="page-header-sub">Biomaterials, restorative composites, instruments, and reorder thresholds synced to Supabase</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-primary" onClick={() => setIsAddModalOpen(true)}>
            <span>Add inventory item</span> <ArrowUpRight />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid kpi-grid-4" style={{ marginBottom: "1.5rem" }}>
        {[
          { label: "Total SKUs", value: String(items.length), sub: "Tracked clinical items", isDanger: false },
          { label: "Healthy Stock", value: String(inStockCount), sub: "Above minimum reorder level", isDanger: false },
          { label: "Reorder Required", value: String(lowStock.length), sub: "Below minimum safety threshold", isDanger: lowStock.length > 0 },
          { label: "Inventory Valuation", value: `EGP ${formatCurrency(totalValue)}`, sub: "Current on-hand cost", isDanger: false },
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
          placeholder="Search by SKU, product name, or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-search"
        />
        <div className="filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`filter-chip ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap card inventory-table-wrap" data-scroll-edge={inventoryScrollEdge} ref={inventoryTableWrapRef} role="region" aria-label="Inventory items table. Scroll horizontally to view all columns." tabIndex={0}>
        <table className="data-table inventory-data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Material / Item Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Min safety level</th>
              <th>Unit cost</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td data-label="SKU" style={{ fontWeight: 650, fontFamily: "var(--font-geist-mono)" }}>{item.sku}</td>
                <td data-label="Material / Item Name" style={{ fontWeight: 600 }}>{item.name}</td>
                <td data-label="Category">{item.category}</td>
                <td data-label="Stock">
                  <strong>{item.quantity}</strong> {item.unit}s
                </td>
                <td data-label="Min safety level">{item.minQuantity} {item.unit}s</td>
                <td data-label="Unit cost" style={{ fontFamily: "var(--font-geist-mono)" }}>EGP {formatCurrency(parseFloat(item.unitCost) || 0)}</td>
                <td data-label="Supplier">{item.supplier || "—"}</td>
                <td data-label="Status">
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </td>
                <td data-label="Action">
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem", minHeight: "28px" }}
                    onClick={() => {
                      setRestockModalItem(item);
                      setRestockQty("10");
                    }}
                  >
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Supply Chain Management</span>
                <h2>Add Inventory Item</h2>
                <p>Register a new clinical consumable, instrument, or material to stock</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddItem} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>
                    Item / Product Name
                    <span className="modal-field-hint">Brand &amp; specification</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Composite Resin A2 (Filtek Supreme)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="modal-grid-2">
                  <div className="modal-field">
                    <label>
                      Category
                      <span className="modal-field-hint">Classification</span>
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="modal-select"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>
                      Unit of Measure
                      <span className="modal-field-hint">Packaging type</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="e.g. syringe, box, pack, bottle, pair"
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="modal-grid-3">
                  <div className="modal-field">
                    <label>
                      Initial Qty
                      <span className="modal-field-hint">Opening count</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="modal-input"
                      placeholder="0"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Min Safety Level
                      <span className="modal-field-hint">Reorder alert trigger</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={newMinQty}
                      onChange={(e) => setNewMinQty(e.target.value)}
                      className="modal-input"
                      placeholder="5"
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      Unit Cost (EGP)
                      <span className="modal-field-hint">Cost per unit</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="modal-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>
                    Supplier / Medical Distributor
                    <span className="modal-field-hint">Vendor contact</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3M Dental Egypt, Dentsply Sirona, Henry Schein"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Add to Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="modal-backdrop" onClick={() => setRestockModalItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-strip">
              <div className="modal-header-titles">
                <span className="modal-category-badge">Stock Replenishment</span>
                <h2>Restock {restockModalItem.name}</h2>
                <p>Receive shipments and update live clinic warehouse quantities</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRestockModalItem(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRestock} style={{ display: "contents" }}>
              <div className="modal-body">
                <div className="modal-info-banner">
                  <span>
                    Current Stock: <strong>{restockModalItem.quantity} {restockModalItem.unit}s</strong> · Minimum Threshold: <strong>{restockModalItem.minQuantity} {restockModalItem.unit}s</strong>
                  </span>
                </div>

                <div className="modal-field">
                  <label>
                    Quantity to Receive ({restockModalItem.unit}s)
                    <span className="modal-field-hint">Delivered units</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 10"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setRestockModalItem(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="button button-primary">
                  {submitting ? "Saving to database..." : "Confirm Delivery & Save to DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
