"use client";

import { useEffect, useRef, useState } from "react";
import "@/app/home.css";
import { PageHeroVisual } from "@/components/public/page-hero-visual";
import Link from "next/link";

interface PriceItem {
  id: string;
  category: string;
  categoryId: "all" | "diagnostic" | "preventive" | "restorative" | "cosmetic" | "emergency";
  item: string;
  description: string;
  price: string;
  priceNum: number;
  duration: string;
  includes: string;
  popular?: boolean;
}

const priceItems: PriceItem[] = [
  {
    id: "p1",
    category: "Examination & Diagnostics",
    categoryId: "diagnostic",
    item: "Comprehensive New Patient Consultation",
    description: "Detailed dental history review, oral cancer screening, full visual examination, and written treatment plan.",
    price: "EGP 200",
    priceNum: 200,
    duration: "30 min",
    includes: "Intraoral photos & consultation breakdown",
    popular: true,
  },
  {
    id: "p2",
    category: "Examination & Diagnostics",
    categoryId: "diagnostic",
    item: "Routine Periodic Check-up",
    description: "Maintenance assessment for existing patients to check gum health, restorations, and early enamel wear.",
    price: "EGP 150",
    priceNum: 150,
    duration: "20 min",
    includes: "Visual assessment & hygiene recommendations",
  },
  {
    id: "p3",
    category: "Examination & Diagnostics",
    categoryId: "diagnostic",
    item: "Digital Bitewing / Periapical X-Ray",
    description: "Low-radiation high-definition digital sensor imaging for sub-gingival and interproximal diagnostics.",
    price: "EGP 80",
    priceNum: 80,
    duration: "5 min",
    includes: "Chairside screen review & digital copy",
  },
  {
    id: "p4",
    category: "Preventive Care",
    categoryId: "preventive",
    item: "Ultrasonic Scaling & Airflow Polish",
    description: "Gentle removal of tartar, bacterial plaque, and superficial tea/coffee stains with fluoride application.",
    price: "EGP 350",
    priceNum: 350,
    duration: "45 min",
    includes: "Tartar debridement & enamel protective polish",
    popular: true,
  },
  {
    id: "p5",
    category: "Preventive Care",
    categoryId: "preventive",
    item: "High-Strength Enamel Fluoride Treatment",
    description: "Topical medical-grade fluoride varnish application to strengthen sensitive teeth and prevent decay.",
    price: "EGP 120",
    priceNum: 120,
    duration: "15 min",
    includes: "Enamel desensitization barrier",
  },
  {
    id: "p6",
    category: "Restorative Dentistry",
    categoryId: "restorative",
    item: "Single-Surface Composite Filling",
    description: "Colour-matched bioceramic resin layered to restore minor cavities with invisible, durable margins.",
    price: "EGP 450",
    priceNum: 450,
    duration: "45 min",
    includes: "Local anaesthesia & shade matching",
  },
  {
    id: "p7",
    category: "Restorative Dentistry",
    categoryId: "restorative",
    item: "Multi-Surface Composite Restoration",
    description: "Complex structural buildup for deeper fissures and extensive interdental decay.",
    price: "EGP 650",
    priceNum: 650,
    duration: "60 min",
    includes: "Cusp reconstruction & bite balancing",
  },
  {
    id: "p8",
    category: "Restorative Dentistry",
    categoryId: "restorative",
    item: "Monolithic Zirconia / E-max Porcelain Crown",
    description: "Precision-milled ceramic crown providing natural aesthetics and durable functional chewing load.",
    price: "EGP 1,800",
    priceNum: 1800,
    duration: "2 visits",
    includes: "Digital intraoral scan & temporary crown",
    popular: true,
  },
  {
    id: "p9",
    category: "Smile Care & Aesthetics",
    categoryId: "cosmetic",
    item: "Professional Take-Home Whitening Kit",
    description: "Custom laboratory-crafted trays with dentist-dispensed carbamide peroxide whitening gels.",
    price: "EGP 900",
    priceNum: 900,
    duration: "2 weeks",
    includes: "Custom upper/lower trays & 4 gel syringes",
  },
  {
    id: "p10",
    category: "Smile Care & Aesthetics",
    categoryId: "cosmetic",
    item: "In-Chair Laser Smile Lightening",
    description: "Immediate single-visit shade lift using protective gum dam barriers and light-activated peroxide.",
    price: "EGP 1,500",
    priceNum: 1500,
    duration: "90 min",
    includes: "Post-bleach remineralizing treatment",
  },
  {
    id: "p11",
    category: "Emergency Care",
    categoryId: "emergency",
    item: "Same-Day Emergency Relief Appointment",
    description: "Immediate assessment and emergency intervention for acute toothache, trauma, or swelling.",
    price: "EGP 300",
    priceNum: 300,
    duration: "30 min",
    includes: "Diagnostic check, pain relief & temporary plan",
  },
  {
    id: "p12",
    category: "Emergency Care",
    categoryId: "emergency",
    item: "Emergency Temporary Restoration / Sedative Dressing",
    description: "Sedative protective filling placed to soothe an inflamed pulp or stabilize a fractured cusp.",
    price: "EGP 250",
    priceNum: 250,
    duration: "30 min",
    includes: "Pulp-calming medication & sealing",
  },
];

const filterTabs = [
  { id: "all", label: "All Treatments" },
  { id: "diagnostic", label: "Diagnostic" },
  { id: "preventive", label: "Preventive" },
  { id: "restorative", label: "Restorative" },
  { id: "cosmetic", label: "Smile & Whitening" },
  { id: "emergency", label: "Emergency" },
];

export default function Pricelist() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scrollEdge, setScrollEdge] = useState<"none" | "start" | "end">("end");
  const priceTableWrapRef = useRef<HTMLDivElement>(null);

  const filteredItems = priceItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.categoryId === activeTab;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    const tableWrap = priceTableWrapRef.current;
    if (!tableWrap) return;

    const updateScrollEdge = () => {
      const maxScrollLeft = tableWrap.scrollWidth - tableWrap.clientWidth;

      if (maxScrollLeft <= 1) {
        setScrollEdge("none");
      } else if (tableWrap.scrollLeft <= 1) {
        setScrollEdge("end");
      } else if (maxScrollLeft - tableWrap.scrollLeft <= 1) {
        setScrollEdge("start");
      } else {
        setScrollEdge("none");
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

  return (
    <>
      <div className="demo-banner animate-fade-in-down">
        <span className="demo-dot" aria-hidden="true" />
        Demo clinic · Clinic details, prices, and patient stories are fictional
      </div>

      <section className="page-hero" aria-labelledby="page-title">
        <div className="page-hero-copy">
          <p className="hero-location">
            <span aria-hidden="true" /> Published Transparency
          </p>
          <h1 id="page-title">Transparent pricing, published clearly.</h1>
          <p className="hero-description">
            We believe you deserve total clarity regarding your oral health investments. Every treatment is quoted in writing before clinical procedures commence.
          </p>
        </div>
        <PageHeroVisual src="/images/hero-pricelist.jpg" />
      </section>

      {/* Pricing Guarantees Banner */}
      <section className="pricing-guarantees-strip" aria-label="Our Pricing Commitments">
        <div className="guarantees-grid">
          <div className="guarantee-card">
            <div className="guarantee-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" className="guarantee-icon">
                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.2 6.3-4 4a.8.8 0 0 1-1.1 0l-2-2a.8.8 0 1 1 1.1-1.1l1.5 1.4 3.4-3.4a.8.8 0 0 1 1.1 1.1Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="guarantee-copy">
              <strong>Itemized Written Quotes</strong>
              <span>No unexpected surprises on your invoice</span>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" className="guarantee-icon">
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2h7A2.5 2.5 0 0 1 16 4.5v11a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 4 15.5v-11Zm3 3.5a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7Zm0 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H7Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="guarantee-copy">
              <strong>VAT & Fee Breakdown</strong>
              <span>Standard 15% VAT detailed clearly</span>
            </div>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" className="guarantee-icon">
                <path d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM9.2 6a.8.8 0 0 1 1.6 0v4.2l2.6 1.5a.8.8 0 0 1-.8 1.4l-3-1.8A.8.8 0 0 1 9.2 12.6V6Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="guarantee-copy">
              <strong>Transparent Timelines</strong>
              <span>Estimated chair time per clinical step</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricelist Section */}
      <section className="pricelist-section section-wrap" aria-labelledby="pricelist-title">
        <div className="section-intro">
          <div>
            <p className="section-label">Price List</p>
            <h2 id="pricelist-title">Published clinical fees.</h2>
          </div>
          <p className="section-description">
            All prices are stated in Saudi Riyals (SAR). Fictional showcase data illustrating Northline&apos;s commitment to open healthcare costs.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="pricelist-toolbar">
          <div className="pricelist-search-box">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              aria-label="Search treatments or categories"
              placeholder="Search by procedure name (e.g. Zirconia, Scaling, Filling)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pricelist-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="clear-search-btn"
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </div>

          <div className="pricelist-tab-pills" role="tablist" aria-label="Filter prices by treatment department">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-pill ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span>{tab.label}</span>
                <span className="tab-pill-count">
                  {tab.id === "all"
                    ? priceItems.length
                    : priceItems.filter((i) => i.categoryId === tab.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Polished Price Cards & Table Wrap */}
        <div className="price-table-card">
          <div
            className="price-table-wrap"
            data-scroll-edge={scrollEdge}
            ref={priceTableWrapRef}
          >
            <table className="price-table" aria-labelledby="pricelist-title">
              <thead>
                <tr>
                  <th scope="col" className="col-procedure">Procedure & Details</th>
                  <th scope="col" className="col-duration numeric">Duration</th>
                  <th scope="col" className="col-price numeric">Standard Fee</th>
                  <th scope="col" className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-price-state">
                      <p>No procedures found matching &ldquo;{searchQuery}&rdquo;</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveTab("all");
                        }}
                        className="button button-outline"
                      >
                        Reset filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="price-row">
                      <td className="col-procedure">
                        <div className="procedure-meta">
                          <span className="price-category-badge">{item.category}</span>
                          {item.popular && (
                            <span className="popular-tag">Commonly Requested</span>
                          )}
                        </div>
                        <strong className="price-item-title">{item.item}</strong>
                        <p className="price-item-desc">{item.description}</p>
                        <span className="price-item-includes">
                          <span className="check-dot" aria-hidden="true">✓</span> Includes: {item.includes}
                        </span>
                      </td>

                      <td className="numeric col-duration">
                        <span className="duration-pill">{item.duration}</span>
                      </td>

                      <td className="numeric col-price">
                        <span className="price-amount">{item.price}</span>
                        <span className="price-vat-sub">+15% VAT applicable</span>
                      </td>

                      <td className="col-action">
                        <Link
                          href={`/contact?service=${encodeURIComponent(item.item)}`}
                          className="button button-outline table-book-btn"
                          aria-label={`Book appointment for ${item.item}`}
                        >
                          Book →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="price-card-footer">
            <div className="price-note-group">
              <span className="note-star" aria-hidden="true">ℹ</span>
              <p className="price-note">
                <strong>Medical Notice:</strong> The prices listed are standard clinical estimates. Exact treatment fees depend on individual anatomical complexity, which is determined following physical examination and digital radiograph review.
              </p>
            </div>
            <Link href="/contact" className="button button-primary">
              Book consultation with written quote →
            </Link>
          </div>
        </div>

        {/* Insurance & Payment Options Strip */}
        <div className="payment-options-box">
          <div className="payment-options-header">
            <h3>Accepted Payment & Direct Billing</h3>
            <p>Flexible ways to take care of your smile without administrative delays.</p>
          </div>
          <div className="payment-badges-row">
            <span className="payment-chip">Mada Debit</span>
            <span className="payment-chip">Visa / MasterCard</span>
            <span className="payment-chip">Apple Pay</span>
            <span className="payment-chip">Direct Insurance Reimbursement Invoicing</span>
            <span className="payment-chip">0% 4-Month Split Options</span>
          </div>
        </div>
      </section>
    </>
  );
}
