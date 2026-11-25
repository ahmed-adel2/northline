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

export interface PublicDoctor {
  id: string;
  fullName: string;
  specialty: string | null;
  color: string | null;
  publicTitle: string | null;
  experience: string | null;
  availability: string | null;
  languages: string[];
  qualifications: string[];
  bio: string | null;
  philosophy: string | null;
}

export function TeamClient({ doctors }: { doctors: PublicDoctor[] }) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const teamFilterTabs = [
    { id: "all", label: "All Clinicians" },
    ...Array.from(new Set(doctors.flatMap((doctor) => doctor.specialty ? [doctor.specialty] : [])))
      .map((specialty) => ({ id: `specialty:${specialty}`, label: specialty })),
  ];

  const filteredMembers = doctors.filter(
    (doctor) => selectedDept === "all" || `specialty:${doctor.specialty}` === selectedDept
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
            <span aria-hidden="true" /> Clinical Excellence
          </p>
          <h1 id="page-title">Meet the people behind your care.</h1>
          <p className="hero-description">
            A cohesive multidisciplinary dental team dedicated to evidence-based practice, patient comfort, and total clarity at every chairside step.
          </p>
        </div>
        <PageHeroVisual src="/images/hero-team.jpg" className="animate-fade-in-up delay-300" />
      </section>

      {/* Clinical Values & Credential Strip */}
      <section className="team-values-strip" aria-label="Clinical Standards">
        <div className="values-grid">
          <div className="value-card">
            <span className="value-icon" aria-hidden="true">★</span>
            <div className="value-copy">
              <strong>Verified Medical Board Licenses</strong>
              <span>Saudi Commission for Health Specialties (SCFHS) registered</span>
            </div>
          </div>
          <div className="value-card">
            <span className="value-icon" aria-hidden="true">♥</span>
            <div className="value-copy">
              <strong>Continuous Medical Education</strong>
              <span>50+ hours annual advanced clinical training per doctor</span>
            </div>
          </div>
          <div className="value-card">
            <span className="value-icon" aria-hidden="true">✦</span>
            <div className="value-copy">
              <strong>Dedicated Patient Advocates</strong>
              <span>Multilingual team supporting Arabic, English & French</span>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section section-wrap animate-fade-in-up delay-300" aria-labelledby="team-title">
        <div className="section-intro">
          <div>
            <p className="section-label">Our clinicians</p>
            <h2 id="team-title">Care built around you.</h2>
          </div>
          <p className="section-description">
            Filter our clinicians by medical discipline to discover their credentials, focus areas, and clinical philosophy.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="team-filter-bar" role="tablist" aria-label="Filter clinical team">
          {teamFilterTabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={selectedDept === tab.id}
              className={`filter-pill ${selectedDept === tab.id ? "active" : ""}`}
              onClick={() => setSelectedDept(tab.id)}
              type="button"
            >
              <span>{tab.label}</span>
              <span className="filter-pill-count">
                {tab.id === "all"
                  ? doctors.length
                  : doctors.filter((doctor) => `specialty:${doctor.specialty}` === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Team Grid */}
        <div className="team-grid">
          {filteredMembers.length === 0 && (
            <p className="section-description">No active clinicians are currently listed.</p>
          )}
          {filteredMembers.map((member) => {
            const accentColor = member.color || "var(--clinic-teal)";
            const initials = member.fullName
              .replace(/^Dr\.\s*/i, "")
              .split(/\s+/)
              .map((part) => part[0] ?? "")
              .join("")
              .slice(0, 2);

            return (
            <article
              className="team-card animate-fade-in-up"
              key={member.id}
              style={{ borderTopColor: accentColor }}
            >
              <div className="team-card-top">
                <div
                  className="team-avatar"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 14%, white)`,
                    color: accentColor,
                    border: `2px solid ${accentColor}`,
                  }}
                  aria-hidden="true"
                >
                  <span>{initials}</span>
                </div>

                <div className="team-title-wrap">
                  <div className="team-name-row">
                    <h3>{member.fullName}</h3>
                  </div>
                  {member.publicTitle && (
                    <p className="team-role" style={{ color: accentColor }}>{member.publicTitle}</p>
                  )}
                  {member.experience && <span className="team-years">{member.experience}</span>}
                </div>
              </div>

              <div className="team-body flex flex-col gap-3">
                {member.specialty && (
                  <div className="team-focus-badge">
                    <span className="focus-indicator" style={{ backgroundColor: accentColor }} aria-hidden="true" />
                    <span>{member.specialty}</span>
                  </div>
                )}

                {member.availability && (
                  <div className="team-availability-badge">
                    <span className="avail-icon" aria-hidden="true">⏱</span>
                    <span>{member.availability}</span>
                  </div>
                )}

                {member.bio && <p className="team-bio">{member.bio}</p>}

                {member.philosophy && (
                  <blockquote className="team-quote">
                    &ldquo;{member.philosophy}&rdquo;
                  </blockquote>
                )}

                {member.languages.length > 0 && (
                  <div className="team-languages">
                    <span className="lang-label">Languages:</span>
                    <div className="lang-tags">
                      {member.languages.map((lang) => (
                        <span key={lang} className="lang-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}

                {member.qualifications.length > 0 && (
                  <div className="team-qualifications">
                    <h4 className="qualifications-heading">Credentials & Education</h4>
                    <ul>
                      {member.qualifications.map((qualification) => (
                        <li key={qualification}>
                          <span className="q-check" aria-hidden="true">✓</span>
                          <span>{qualification}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="team-card-actions">
                  <Link
                    href={`/contact?doctor=${encodeURIComponent(member.fullName)}`}
                    className="button button-primary team-book-btn"
                  >
                    Book with Dr. {member.fullName.replace(/^Dr\.\s*/i, "").split(/\s+/)[0]} <ArrowUpRight />
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
