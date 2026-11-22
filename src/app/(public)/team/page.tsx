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

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: "all" | "leadership" | "restorative" | "preventive" | "paediatric" | "hygiene";
  focus: string;
  years: string;
  avatarColor: string;
  accentHue: string;
  availability: string;
  languages: string[];
  qualifications: string[];
  bio: string;
  philosophy: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "amira",
    name: "Dr. Amira Hassan",
    initials: "AH",
    role: "Founder & Principal Dentist",
    department: "restorative",
    focus: "Biomimetic Restoration & Aesthetic Rehabilitation",
    years: "15+ Years Clinical Experience",
    avatarColor: "oklch(91% 0.05 185)",
    accentHue: "oklch(46% 0.13 185)",
    availability: "Available Mon, Wed, Sat",
    languages: ["Arabic (Native)", "English (Fluent)"],
    qualifications: [
      "BDS, King Saud University",
      "MSc Restorative Dentistry, King's College London",
      "Fellow, International Team for Implantology (ITI)",
      "Member, Saudi Dental Society",
    ],
    bio: "Amira founded Northline after 15 years in hospital and private clinical dentistry. She champions conservative, biomimetic dentistry—preserving natural tooth structure wherever possible.",
    philosophy: "Every smile starts with open, unhurried dialogue, not a checklist of procedures.",
  },
  {
    id: "omar",
    name: "Dr. Omar Al-Rashid",
    initials: "OR",
    role: "Senior Associate Dentist",
    department: "preventive",
    focus: "Preventive Care & Minimal Intervention",
    years: "8+ Years Clinical Experience",
    avatarColor: "oklch(92% 0.05 145)",
    accentHue: "oklch(45% 0.12 150)",
    availability: "Available Sun, Tue, Thu",
    languages: ["Arabic (Native)", "English (Fluent)"],
    qualifications: [
      "BDS, King Abdulaziz University",
      "Certified in Minimal Intervention Dentistry",
      "Diploma in Advanced Dental Diagnostics",
    ],
    bio: "Omar focuses on family dentistry and interceptive care, guiding patients to avoid extensive surgeries through early digital diagnostic screenings and practical home routines.",
    philosophy: "The best treatment is preventing disease before intervention is ever necessary.",
  },
  {
    id: "layla",
    name: "Dr. Layla Mahmoud",
    initials: "LM",
    role: "Paediatric & Anxiety Specialist",
    department: "paediatric",
    focus: "Paediatric Care & Anxiety-Sensitive Dentistry",
    years: "6+ Years Clinical Experience",
    avatarColor: "oklch(92% 0.06 60)",
    accentHue: "oklch(56% 0.14 55)",
    availability: "Available Daily (Morning/Afternoon)",
    languages: ["Arabic (Native)", "English (Fluent)", "French (Conversational)"],
    qualifications: [
      "BDS, Princess Nourah University",
      "Paediatric Dentistry Clinical Fellowship",
      "Certified Dental Sedation Practitioner",
    ],
    bio: "Layla specializes in caring for children and highly anxious patients. Her appointments are characterized by calm sensory pacing, transparent explanations, and zero rush.",
    philosophy: "Helping a nervous patient or child smile in the chair is the most rewarding achievement.",
  },
  {
    id: "sarah",
    name: "Sarah Chen, RDH",
    initials: "SC",
    role: "Lead Periodontal Hygienist",
    department: "hygiene",
    focus: "Periodontal Therapy & Preventative Maintenance",
    years: "12+ Years Clinical Experience",
    avatarColor: "oklch(92% 0.05 220)",
    accentHue: "oklch(48% 0.12 215)",
    availability: "Available Sun through Thu",
    languages: ["English (Native)", "Arabic (Conversational)", "Mandarin (Native)"],
    qualifications: [
      "DH, Riyadh Colleges of Dentistry",
      "Certified in Advanced Periodontal Instrumentation",
      "Airflow Master Class Credential",
    ],
    bio: "Sarah leads oral wellness education and deep periodontal care. She uses state-of-the-art guided biofilm therapy to provide painless, comprehensive hygiene maintenance.",
    philosophy: "Equipping patients with personalized hygiene habits transforms their health for life.",
  },
];

const teamFilterTabs = [
  { id: "all", label: "All Clinicians" },
  { id: "restorative", label: "Restorative" },
  { id: "preventive", label: "Preventive" },
  { id: "paediatric", label: "Paediatric & Anxiety" },
  { id: "hygiene", label: "Hygiene & Gums" },
];

export default function Team() {
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const filteredMembers = teamMembers.filter(
    (m) => selectedDept === "all" || m.department === selectedDept
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
                  ? teamMembers.length
                  : teamMembers.filter((m) => m.department === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Team Grid */}
        <div className="team-grid">
          {filteredMembers.map((member) => (
            <article
              className="team-card animate-fade-in-up"
              key={member.id}
              style={{ borderTopColor: member.accentHue }}
            >
              <div className="team-card-top">
                <div
                  className="team-avatar"
                  style={{
                    backgroundColor: member.avatarColor,
                    color: member.accentHue,
                    border: `2px solid ${member.accentHue}`,
                  }}
                  aria-hidden="true"
                >
                  <span>{member.initials}</span>
                </div>

                <div className="team-title-wrap">
                  <div className="team-name-row">
                    <h3>{member.name}</h3>
                  </div>
                  <p className="team-role" style={{ color: member.accentHue }}>{member.role}</p>
                  <span className="team-years">{member.years}</span>
                </div>
              </div>

              <div className="team-body flex flex-col gap-3">
                <div className="team-focus-badge">
                  <span className="focus-indicator" style={{ backgroundColor: member.accentHue }} aria-hidden="true" />
                  <span>{member.focus}</span>
                </div>

                <div className="team-availability-badge">
                  <span className="avail-icon" aria-hidden="true">⏱</span>
                  <span>{member.availability}</span>
                </div>

                <p className="team-bio">{member.bio}</p>

                <blockquote className="team-quote">
                  &ldquo;{member.philosophy}&rdquo;
                </blockquote>

                <div className="team-languages">
                  <span className="lang-label">Languages:</span>
                  <div className="lang-tags">
                    {member.languages.map((lang) => (
                      <span key={lang} className="lang-tag">{lang}</span>
                    ))}
                  </div>
                </div>

                <div className="team-qualifications">
                  <h4 className="qualifications-heading">Credentials & Education</h4>
                  <ul>
                    {member.qualifications.map((q) => (
                      <li key={q}>
                        <span className="q-check" aria-hidden="true">✓</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="team-card-actions">
                  <Link
                    href={`/contact?doctor=${encodeURIComponent(member.name)}`}
                    className="button button-primary team-book-btn"
                  >
                    Book with {member.name.split(" ")[0]} <ArrowUpRight />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
