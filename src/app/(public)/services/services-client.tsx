"use client";

import { useState } from "react";
import Link from "next/link";
import "@/app/home.css";
import { PageHeroVisual } from "@/components/public/page-hero-visual";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ServiceItem {
  number: string;
  category: "all" | "preventive" | "restorative" | "cosmetic" | "specialized";
  categoryLabel: string;
  title: string;
  description: string;
  duration: string;
  keyBenefits: string[];
  accentHue: string;
  badgeBg: string;
  popular?: boolean;
}

const services: ServiceItem[] = [
  {
    number: "01",
    category: "preventive",
    categoryLabel: "Preventive",
    title: "Preventive Dentistry & Check-ups",
    description: "Digital intraoral scanning, proactive dental examinations, and personalized hygiene regimens designed to prevent disease before it begins.",
    duration: "30–45 min",
    keyBenefits: ["Oral health baseline", "Cancer screening", "Airflow stain removal"],
    accentHue: "oklch(48% 0.12 185)",
    badgeBg: "oklch(91% 0.05 185)",
    popular: true,
  },
  {
    number: "02",
    category: "restorative",
    categoryLabel: "Restorative",
    title: "Biomimetic Restorations & Fillings",
    description: "Layered composite resin and ceramic restorations that bond intimately to natural tooth enamel, restoring anatomical function without removing healthy tooth structure.",
    duration: "45–90 min",
    keyBenefits: ["Tooth-colored ceramic matching", "Micro-invasive preparation", "Durable masticatory load"],
    accentHue: "oklch(46% 0.13 150)",
    badgeBg: "oklch(92% 0.05 145)",
    popular: true,
  },
  {
    number: "03",
    category: "cosmetic",
    categoryLabel: "Cosmetic",
    title: "Cosmetic & Smile Enhancement",
    description: "In-chair laser brightening, custom take-home whitening, and conservative porcelain veneers crafted to complement your natural facial aesthetics.",
    duration: "45–90 min",
    keyBenefits: ["Digital smile preview", "Minimal tooth reduction", "Enamel-safe whitening"],
    accentHue: "oklch(50% 0.13 280)",
    badgeBg: "oklch(93% 0.05 280)",
  },
  {
    number: "04",
    category: "specialized",
    categoryLabel: "Emergency",
    title: "Urgent & Same-Day Emergency Care",
    description: "Immediate triage for severe toothaches, chipped or knocked-out teeth, and unexpected swelling. Focused first on compassionate pain relief.",
    duration: "30–60 min",
    keyBenefits: ["Priority booking", "Immediate pain relief", "Sedative dressings"],
    accentHue: "oklch(52% 0.15 25)",
    badgeBg: "oklch(91% 0.06 25)",
    popular: true,
  },
  {
    number: "05",
    category: "preventive",
    categoryLabel: "Periodontal",
    title: "Gum Therapy & Periodontal Care",
    description: "Ultrasonic sub-gingival debridement and biofilm therapy to resolve bleeding, halt bone recession, and stabilize tooth foundations.",
    duration: "30–60 min",
    keyBenefits: ["Deep pocket therapy", "Bacterial biofilm control", "Pocket reduction plans"],
    accentHue: "oklch(46% 0.12 215)",
    badgeBg: "oklch(92% 0.05 215)",
  },
  {
    number: "06",
    category: "restorative",
    categoryLabel: "Endodontics",
    title: "Gentle Endodontic Therapy (Root Canal)",
    description: "Modern rotary instrument disinfection to calm infected tooth roots, eliminating pain and allowing you to preserve your natural tooth.",
    duration: "60–90 min",
    keyBenefits: ["Preserves natural root", "High-precision apex locator", "Bacterial seal"],
    accentHue: "oklch(48% 0.13 45)",
    badgeBg: "oklch(92% 0.06 50)",
  },
  {
    number: "07",
    category: "specialized",
    categoryLabel: "Paediatric",
    title: "Paediatric & Children's Dentistry",
    description: "Gentle, sensory-friendly visits for infants, toddlers, and young teens. We foster trust and confidence so dental visits become second nature.",
    duration: "30–45 min",
    keyBenefits: ["Fissure sealants", "Cavity risk assessment", "Calm sensory atmosphere"],
    accentHue: "oklch(56% 0.14 55)",
    badgeBg: "oklch(92% 0.06 60)",
  },
  {
    number: "08",
    category: "restorative",
    categoryLabel: "Prosthodontics",
    title: "Tooth Replacement & Implant Planning",
    description: "From single-tooth zirconia crowns and fixed bridges to digital implant planning for long-term functional and aesthetic smile restoration.",
    duration: "45–90 min",
    keyBenefits: ["3D digital impressions", "Natural bite balance", "Biocompatible materials"],
    accentHue: "oklch(45% 0.12 185)",
    badgeBg: "oklch(91% 0.05 185)",
  },
  {
    number: "09",
    category: "cosmetic",
    categoryLabel: "Orthodontics",
    title: "Orthodontic & Clear Aligner Consultation",
    description: "Comprehensive bite assessment and digital 3D teeth alignment mapping using discreet, comfortable clear aligner systems.",
    duration: "30–45 min",
    keyBenefits: ["Bite correction", "Virtual treatment timeline", "Removable aligners"],
    accentHue: "oklch(49% 0.13 310)",
    badgeBg: "oklch(93% 0.05 310)",
  },
  {
    number: "10",
    category: "specialized",
    categoryLabel: "Surgery",
    title: "Oral Surgery & Wisdom Tooth Care",
    description: "Atraumatic tooth removal and minor oral surgical procedures conducted with gentle anaesthesia and step-by-step recovery monitoring.",
    duration: "30–60 min",
    keyBenefits: ["Atraumatic technique", "Detailed home recovery guide", "Post-op check-in"],
    accentHue: "oklch(48% 0.12 15)",
    badgeBg: "oklch(92% 0.05 20)",
  },
];

const serviceCategories = [
  { id: "all", label: "All Treatments" },
  { id: "preventive", label: "Preventive & Hygiene" },
  { id: "restorative", label: "Restorative & Root Canal" },
  { id: "cosmetic", label: "Cosmetic & Aligners" },
  { id: "specialized", label: "Paediatric & Surgery" },
];

export default function Services({ showPricelist }: { showPricelist: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredServices = services.filter(
    (s) => activeCategory === "all" || s.category === activeCategory
  );

  return (
    <>
      <div className="demo-banner animate-fade-in-down">
        <span className="demo-dot" aria-hidden="true" />
        Demo clinic · Clinic details, prices, and patient stories are fictional
      </div>

      <section className="page-hero animate-fade-in-up delay-100" aria-labelledby="page-title">
        <div className="page-hero-copy animate-fade-in-up delay-200">
          <p className="hero-location">
            <span aria-hidden="true" /> Clinical Care Spectrum
          </p>
          <h1 id="page-title">Comprehensive care, shaped around you.</h1>
          <p className="hero-description">
            Explore our clinical disciplines. Every treatment is delivered with modern instrumentation, conservative techniques, and full transparency.
          </p>
        </div>
        <PageHeroVisual src="/images/hero-services.jpg" className="animate-fade-in-up delay-300" />
      </section>

      {/* Services Care Standard Strip */}
      <section className="services-standard-strip" aria-label="Our Clinical Standard">
        <div className="standards-grid">
          <div className="standard-card">
            <span className="standard-icon" aria-hidden="true">💎</span>
            <div className="standard-copy">
              <strong>Biomimetic Philosophy</strong>
              <span>Preserving natural healthy enamel and tissue first</span>
            </div>
          </div>
          <div className="standard-card">
            <span className="standard-icon" aria-hidden="true">📷</span>
            <div className="standard-copy">
              <strong>High-Def Digital Imaging</strong>
              <span>Chairside visual screens so you see what we see</span>
            </div>
          </div>
          <div className="standard-card">
            <span className="standard-icon" aria-hidden="true">📋</span>
            <div className="standard-copy">
              <strong>Itemized Estimates</strong>
              <span>Clear written breakdown before procedures begin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section section-wrap animate-fade-in-up delay-300" aria-labelledby="services-title">
        <div className="section-intro">
          <div>
            <p className="section-label">Our services</p>
            <h2 id="services-title">Care shaped around your needs.</h2>
          </div>
          <p className="section-description">
            Select a specialty to explore treatments, typical visit durations, and key clinical benefits.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="services-filter-bar" role="tablist" aria-label="Filter clinical services">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`filter-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
              type="button"
            >
              <span>{cat.label}</span>
              <span className="filter-pill-count">
                {cat.id === "all"
                  ? services.length
                  : services.filter((s) => s.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="service-grid">
          {filteredServices.map((service) => (
            <article
              className="service-card animate-fade-in-up"
              key={service.number}
              style={{ borderTopColor: service.accentHue }}
            >
              <div className="service-card-top">
                <div className="service-header">
                  <span
                    className="service-number-pill"
                    style={{
                      backgroundColor: service.badgeBg,
                      color: service.accentHue,
                    }}
                  >
                    {service.number}
                  </span>
                  <span className="service-category-tag">{service.categoryLabel}</span>
                  {service.popular && (
                    <span className="service-popular-badge">Popular</span>
                  )}
                </div>
                <h3>{service.title}</h3>
              </div>

              <p className="service-desc">{service.description}</p>

              <div className="service-benefits-list">
                <span className="benefits-label">What to expect:</span>
                <ul>
                  {service.keyBenefits.map((b) => (
                    <li key={b}>
                      <span className="benefit-dot" style={{ backgroundColor: service.accentHue }} aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="service-meta">
                <div className="service-duration-badge">
                  <span className="clock-icon" aria-hidden="true">⏱</span>
                  <span>{service.duration}</span>
                </div>
                <Link
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="button-link service-action-link"
                >
                  Consultation <ArrowUpRight />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Consult CTA Section */}
      <section className="cta-section section-wrap animate-fade-in-up delay-400" aria-labelledby="cta-title">
        <div className="cta-card">
          <div className="cta-copy">
            <span className="cta-badge">Need Advice?</span>
            <h2 id="cta-title">Not sure which care is right for your smile?</h2>
            <p>
              Book an unhurried consultation. Our clinicians review your dental health, listen to your concerns, and outline clear choices.
            </p>
          </div>
          <div className="cta-buttons">
            <Link href="/contact" className="button button-primary">
              Book consultation <ArrowUpRight />
            </Link>
            {showPricelist && (
              <Link href="/pricelist" className="button button-outline">
                View transparent pricelist →
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
