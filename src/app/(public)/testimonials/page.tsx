"use client";

import { useState } from "react";
import "@/app/home.css";
import { PageHeroVisual } from "@/components/public/page-hero-visual";
import { googleMapsSearchUrl } from "@/lib/google-maps";
import Link from "next/link";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  treatment: string;
  quote: string;
  rating: number;
  category: "all" | "general" | "pediatric" | "restorative" | "cosmetic";
  categoryLabel: string;
  initials: string;
  avatarColor: string;
  accentHue: string;
  doctorSeen: string;
  date: string;
  verified: boolean;
  highlightTag: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: "t1",
    name: "Mariam Al-Farsi",
    role: "Regular Patient",
    treatment: "Routine Cleaning & Preventive Exam",
    quote: "The dentist explained every detail with intraoral photos before starting. I knew exactly what to expect and what it would cost—zero ambiguity, zero stress.",
    rating: 5,
    category: "general",
    categoryLabel: "General Dentistry",
    initials: "MA",
    avatarColor: "oklch(91% 0.05 185)",
    accentHue: "oklch(48% 0.12 185)",
    doctorSeen: "Dr. Sarah Al-Rashid",
    date: "2 weeks ago",
    verified: true,
    highlightTag: "Transparent Care",
  },
  {
    id: "t2",
    name: "Khalid Nasser",
    role: "Parent of Paediatric Patient",
    treatment: "First Child Dental Visit & Fluoride",
    quote: "My 6-year-old child was anxious beforehand, but the entire nursing and paediatric team was calm, playful, and gentle. We left with smiles instead of tears.",
    rating: 5,
    category: "pediatric",
    categoryLabel: "Paediatric Care",
    initials: "KN",
    avatarColor: "oklch(92% 0.06 60)",
    accentHue: "oklch(56% 0.14 55)",
    doctorSeen: "Dr. Tariq Mansour",
    date: "1 month ago",
    verified: true,
    highlightTag: "Gentle with Kids",
  },
  {
    id: "t3",
    name: "Fatima Omani",
    role: "Restorative Patient",
    treatment: "Ceramic Inlay & Precision Filling",
    quote: "Clear pricing from day one with no surprise add-ons. I appreciated receiving a printed itemized breakdown before approving the restorative plan.",
    rating: 5,
    category: "restorative",
    categoryLabel: "Restorative Care",
    initials: "FO",
    avatarColor: "oklch(92% 0.05 145)",
    accentHue: "oklch(45% 0.12 150)",
    doctorSeen: "Dr. Laila Mansour",
    date: "3 weeks ago",
    verified: true,
    highlightTag: "Itemized Estimate",
  },
  {
    id: "t4",
    name: "Zaid Al-Harbi",
    role: "Cosmetic Patient",
    treatment: "Porcelain Veneers Consultation",
    quote: "The 3D preview showed me the anticipated contour before any tooth preparation occurred. Finding a clinic that respects conservative aesthetics is rare.",
    rating: 5,
    category: "cosmetic",
    categoryLabel: "Cosmetic & Smile Care",
    initials: "ZH",
    avatarColor: "oklch(93% 0.05 280)",
    accentHue: "oklch(50% 0.13 280)",
    doctorSeen: "Dr. Sarah Al-Rashid",
    date: "2 months ago",
    verified: true,
    highlightTag: "Digital Smile Preview",
  },
  {
    id: "t5",
    name: "Noura Al-Shehri",
    role: "Emergency Patient",
    treatment: "Urgent Relief & Root Canal Therapy",
    quote: "I called on a Saturday morning with severe tooth discomfort. They accommodated me within 45 minutes, administered pain relief promptly, and mapped out next steps.",
    rating: 5,
    category: "restorative",
    categoryLabel: "Emergency Care",
    initials: "NS",
    avatarColor: "oklch(91% 0.06 25)",
    accentHue: "oklch(52% 0.15 25)",
    doctorSeen: "Dr. Tariq Mansour",
    date: "Just yesterday",
    verified: true,
    highlightTag: "Rapid Relief",
  },
  {
    id: "t6",
    name: "Hassan Bin Yousef",
    role: "Preventive Care Member",
    treatment: "Airflow Stain Removal & Periodontal Care",
    quote: "Clean, calming environment with ultra-modern instrumentation. The dental hygienist was thorough and gave practical routine tips tailored to my gums.",
    rating: 5,
    category: "general",
    categoryLabel: "General Dentistry",
    initials: "HY",
    avatarColor: "oklch(92% 0.05 220)",
    accentHue: "oklch(48% 0.12 215)",
    doctorSeen: "Dr. Sarah Al-Rashid",
    date: "1 month ago",
    verified: true,
    highlightTag: "Modern Hygiene",
  },
];

const categories = [
  { id: "all", label: "All Experiences" },
  { id: "general", label: "General Dentistry" },
  { id: "pediatric", label: "Paediatric Care" },
  { id: "restorative", label: "Restorative" },
  { id: "cosmetic", label: "Cosmetic Smile" },
];

export default function Testimonials() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const filteredTestimonials = testimonials.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  const handleVote = (id: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <>
      <div className="demo-banner animate-fade-in-down">
        <span className="demo-dot" aria-hidden="true" />
        Demo clinic · Clinic details, prices, and patient stories are fictional
      </div>

      <section className="page-hero" aria-labelledby="page-title">
        <div className="page-hero-copy">
          <p className="hero-location">
            <span aria-hidden="true" /> Verified Patient Journeys
          </p>
          <h1 id="page-title">Patient voices, genuine care.</h1>
          <p className="hero-description">
            Discover real patient perspectives on our transparent treatments, comfortable chairside manner, and clear estimates.
          </p>
        </div>
        <PageHeroVisual src="/images/hero-testimonials.jpg" />
      </section>

      {/* Trust Highlights Strip */}
      <section className="testimonials-trust-strip" aria-label="Patient Satisfaction Highlights">
        <div className="trust-strip-inner">
          <div className="trust-stat-item">
            <span className="trust-stat-number">4.9 / 5</span>
            <div className="trust-stat-meta">
              <span className="trust-stars-row" aria-hidden="true">★★★★★</span>
              <span className="trust-stat-label">Average Satisfaction</span>
            </div>
          </div>
          <div className="trust-divider" aria-hidden="true" />
          <div className="trust-stat-item">
            <span className="trust-stat-number">1,240+</span>
            <div className="trust-stat-meta">
              <span className="trust-stat-highlight">Patients Cared For</span>
              <a
                href={googleMapsSearchUrl("Riyadh, Saudi Arabia")}
                target="_blank"
                rel="noopener noreferrer"
                className="trust-stat-label"
              >
                Across Riyadh Districts
              </a>
            </div>
          </div>
          <div className="trust-divider" aria-hidden="true" />
          <div className="trust-stat-item">
            <span className="trust-stat-number">100%</span>
            <div className="trust-stat-meta">
              <span className="trust-stat-highlight">Written Estimates</span>
              <span className="trust-stat-label">Before Any Procedure Starts</span>
            </div>
          </div>
          <div className="trust-divider" aria-hidden="true" />
          <div className="trust-cta-wrap">
            <button
              onClick={() => setShowShareModal(true)}
              className="button button-primary trust-share-btn"
              type="button"
            >
              Share your story +
            </button>
          </div>
        </div>
      </section>

      {/* Main Testimonial Hub */}
      <section className="testimonials-section section-wrap" aria-labelledby="testimonials-title">
        <div className="section-intro">
          <div>
            <p className="section-label">Patient Voices</p>
            <h2 id="testimonials-title">Experiences shared by our community.</h2>
          </div>
          <p className="section-description">
            Filter by specialty to see how patients experienced treatments from gentle paediatric visits to smile restorations.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="testimonial-filter-bar" role="tablist" aria-label="Filter testimonials by specialty">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={selectedCategory === cat.id}
              className={`filter-pill ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
              type="button"
            >
              <span>{cat.label}</span>
              <span className="filter-pill-count">
                {cat.id === "all"
                  ? testimonials.length
                  : testimonials.filter((t) => t.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="testimonial-grid">
          {filteredTestimonials.map((t, index) => (
            <article
              className="testimonial-card animate-fade-in-up"
              key={t.id}
              style={{
                animationDelay: `${(index + 1) * 80}ms`,
                borderTopColor: t.accentHue,
              }}
            >
              <div className="testimonial-card-header">
                <div
                  className="patient-avatar"
                  style={{
                    backgroundColor: t.avatarColor,
                    color: t.accentHue,
                  }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div className="patient-header-info">
                  <div className="patient-name-row">
                    <strong>{t.name}</strong>
                    {t.verified && (
                      <span className="verified-badge" title="Verified Treatment">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="verified-check" aria-hidden="true">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="patient-treatment-label">{t.treatment}</span>
                </div>
              </div>

              <div className="testimonial-stars-bar">
                <div className="testimonial-stars" aria-label={`Rated ${t.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} aria-hidden="true" className={star <= t.rating ? "star-gold" : "star-empty"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="testimonial-date">{t.date}</span>
              </div>

              <blockquote>
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="testimonial-pill-tag">
                <span className="pill-dot" style={{ backgroundColor: t.accentHue }} aria-hidden="true" />
                <span>{t.highlightTag}</span>
              </div>

              <div className="testimonial-footer-meta">
                <div className="doctor-tag">
                  <span className="doctor-tag-label">Care by:</span>
                  <span className="doctor-tag-name">{t.doctorSeen}</span>
                </div>
                <button
                  type="button"
                  className="helpful-button"
                  onClick={() => handleVote(t.id)}
                  title="Mark this review as helpful"
                >
                  <span className="helpful-heart" aria-hidden="true">♥</span>
                  <span>Helpful ({helpfulVotes[t.id] || 0})</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Onboarding Guide Box for First-time Patients */}
        <div className="first-visit-guide-box">
          <div className="guide-header">
            <div className="guide-badge">
              <span className="guide-dot" aria-hidden="true" />
              First Time at Northline?
            </div>
            <h3>What your journey looks like with us</h3>
            <p>We believe peace of mind comes from knowing each step before sitting in the chair.</p>
          </div>

          <div className="guide-steps-grid">
            <div className="guide-step">
              <span className="guide-step-num">01</span>
              <h4>Listen & Consultation</h4>
              <p>We review your dental history, primary concerns, and comfort preferences without rushing.</p>
            </div>
            <div className="guide-step">
              <span className="guide-step-num">02</span>
              <h4>Visual Diagnostics</h4>
              <p>High-resolution imaging so you can see exactly what the dentist sees on chairside displays.</p>
            </div>
            <div className="guide-step">
              <span className="guide-step-num">03</span>
              <h4>Transparent Quote</h4>
              <p>Receive clear treatment choices and written pricing estimates before any procedure begins.</p>
            </div>
            <div className="guide-step">
              <span className="guide-step-num">04</span>
              <h4>Gentle Treatment</h4>
              <p>Modern techniques focused on preservation, comfort, and ongoing preventative care.</p>
            </div>
          </div>

          <div className="guide-footer-action">
            <Link href="/contact" className="button button-primary">
              Schedule your first visit →
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Modal for Submitting Feedback */}
      {showShareModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="share-title">Share Your Clinic Experience</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowShareModal(false);
                  setFeedbackSubmitted(false);
                }}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="modal-success">
                <span className="success-icon" aria-hidden="true">✓</span>
                <h4>Thank you for sharing your experience!</h4>
                <p>
                  As part of our commitment to privacy and medical ethics, our team reviews all submissions before publishing.
                </p>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setShowShareModal(false);
                    setFeedbackSubmitted(false);
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFeedbackSubmitted(true);
                }}
                className="modal-form"
              >
                <p className="modal-desc">
                  Your feedback helps prospective patients feel at ease and aids us in continually improving our care standard.
                </p>
                <div className="field">
                  <label htmlFor="fb-name">Your Full Name</label>
                  <input id="fb-name" type="text" placeholder="e.g. Sara Al-Hassan" required />
                </div>
                <div className="field">
                  <label htmlFor="fb-treatment">Treatment or Service</label>
                  <input id="fb-treatment" type="text" placeholder="e.g. Preventative Teeth Cleaning" required />
                </div>
                <div className="field">
                  <label htmlFor="fb-quote">Your Experience</label>
                  <textarea id="fb-quote" rows={4} placeholder="How was the communication, comfort, and transparency?" required />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => setShowShareModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button button-primary">
                    Submit for Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
