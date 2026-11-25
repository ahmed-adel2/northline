"use client";

import "@/app/home.css";
import { PageHeroVisual } from "@/components/public/page-hero-visual";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const values = [
  {
    title: "Listen first",
    description: "Every visit begins with your concerns, not our assumptions. We take time to understand your history, goals, and questions before discussing options.",
  },
  {
    title: "Explain clearly",
    description: "Dental terminology can be opaque. We translate findings into plain language so you can make informed decisions without pressure.",
  },
  {
    title: "Plan together",
    description: "Treatment plans are collaborations. We present options with trade-offs, costs, and timelines — you choose what fits your life.",
  },
  {
    title: "Follow through",
    description: "Your dentist can discuss recommended follow-up and answer questions about caring for your teeth between visits.",
  },
];

const clinicHistory = [
  {
    chapter: "The beginning",
    title: "A first visit that makes room",
    description: "The fictional clinic starts by hearing each patient’s goals and concerns before discussing treatment.",
  },
  {
    chapter: "The practice grows",
    title: "Care connects around people",
    description: "Preventive, restorative, and family dentistry become parts of one considered care journey.",
  },
  {
    chapter: "A point of difference",
    title: "Choices come with context",
    description: "Doctors explain options, trade-offs, and costs in plain language before patients decide what feels right.",
  },
  {
    chapter: "Looking ahead",
    title: "The next step stays clear",
    description: "Follow-up and practical guidance continue the conversation beyond the appointment.",
  },
];

export default function About() {
  return (
    <>
      <div className="demo-banner animate-fade-in-down">
        <span className="demo-dot" aria-hidden="true" />
        Demo clinic · Clinic details, prices, and patient stories are fictional
      </div>
      <section className="page-hero animate-fade-in-up delay-100" aria-labelledby="page-title">
        <div className="page-hero-copy animate-fade-in-up delay-200">
          <p className="hero-location"><span aria-hidden="true" /> About Northline Dental Clinic</p>
          <h1 id="page-title">A clinic built around <em>conversation.</em></h1>
          <p className="hero-description">
            Northline is fictional. Explore its approach, illustrative history, and example patient journey.
          </p>
        </div>
        <PageHeroVisual src="/images/hero-about.jpg" className="animate-fade-in-up delay-300" />
      </section>

      <section className="values-section section-wrap animate-fade-in-up delay-300" aria-labelledby="values-title">
        <div className="section-intro">
          <div>
            <p className="section-label">Our principles</p>
            <h2 id="values-title">Four commitments that guide every visit.</h2>
          </div>
        </div>
        <div className="values-grid">
          {values.map((value, index) => (
            <article className="value-card" key={value.title}>
              <span className="value-index">0{index + 1}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="clinic-history-section" aria-labelledby="clinic-history-title">
        <div className="clinic-history-inner">
          <div className="section-intro">
            <div>
              <p className="section-label">Our story</p>
              <h2 id="clinic-history-title">More than a list of services. A way of caring.</h2>
            </div>

          </div>
          <div className="clinic-story-prologue">
            <p className="clinic-story-kicker">The Northline story</p>
            <p className="clinic-story-prologue-copy">
              Northline began with one question: “What matters most to you?” In this imagined clinic, that question shapes every chapter—from the first conversation to a clear plan and thoughtful follow-up.
            </p>
          </div>
          <ol className="clinic-history">
            {clinicHistory.map((milestone, index) => (
              <li className="clinic-history-entry" key={milestone.chapter}>
                <span className="clinic-history-marker" aria-hidden="true">0{index + 1}</span>
                <article className="clinic-history-card">
                  <p className="clinic-history-chapter">{milestone.chapter}</p>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </article>
              </li>
            ))}
          </ol>
          <aside className="clinic-story-distinction" aria-labelledby="clinic-story-distinction-title">
            <div>
              <p className="clinic-story-kicker">What makes it distinct</p>
              <h3 id="clinic-story-distinction-title">One connected care journey, shaped with you.</h3>
            </div>
            <p>
              Clear options, coordinated care, and an understood next step—not just a list of treatments.
            </p>
          </aside>
          <p className="clinic-history-note">
            Fictional story and positioning. Replace with verified history and clinic-specific details before publishing.
          </p>
        </div>
      </section>

      <section className="cta-section section-wrap animate-fade-in-up delay-400" aria-labelledby="cta-title">
        <div className="cta-card">
          <h2 id="cta-title">Ready to start a conversation?</h2>
          <p>See the example contact details and preview form.</p>
          <a href="/contact" className="button button-primary">
            Contact options <ArrowUpRight />
          </a>
        </div>
      </section>
    </>
  );
}
