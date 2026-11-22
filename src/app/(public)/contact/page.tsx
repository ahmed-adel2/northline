"use client";

import { useState, type FormEvent } from "react";
import "@/app/home.css";
import { PageHeroVisual } from "@/components/public/page-hero-visual";
import { googleMapsSearchUrl } from "@/lib/google-maps";

function ArrowUpRight() {
  return (
    <svg className="contact-arrow-icon inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2.5" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleCopy(text: string, key: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
  }

  return (
    <>
      <div className="demo-banner animate-fade-in-down">
        <span className="demo-dot" aria-hidden="true" />
        Demo clinic · Clinic details, prices, and patient stories are fictional
      </div>

      <section className="page-hero animate-fade-in-up delay-100" aria-labelledby="page-title">
        <div className="page-hero-copy animate-fade-in-up delay-200">
          <p className="hero-location">
            <span aria-hidden="true" /> Direct clinic desk
          </p>
          <h1 id="page-title">Start a conversation.</h1>
          <p className="hero-description">
            Whether you are booking a routine hygiene check, consulting on treatment plans, or have questions about care — we are here to help.
          </p>
        </div>
        <PageHeroVisual src="/images/hero-contact.jpg" className="animate-fade-in-up delay-300" />
      </section>

      <section className="contact-section section-wrap animate-fade-in-up delay-300" aria-labelledby="contact-title">
        <div className="contact-grid">
          {/* Left Column: Direct channels and clinic information */}
          <div className="contact-info">
            <div className="contact-info-header">

              <h2 id="contact-title">Connect directly with our care team</h2>
              <p className="contact-lead">
                Reach us via your preferred channel. We respond promptly during clinical hours with clear guidance and unhurried answers.
              </p>
            </div>

            <ul className="contact-details-list" role="list">
              {/* Phone item */}
              <li>
                <a
                  href="tel:+201011604114"
                  className="contact-card-item"
                  aria-label="Call clinic at +201011604114"
                >
                  <div className="contact-card-main">
                    <div className="contact-icon-bubble">
                      <PhoneIcon />
                    </div>
                    <div className="contact-card-text">
                      <span className="contact-card-label">Direct phone line</span>
                      <span className="contact-card-value">+20 10 11 60 4114</span>
                    </div>
                  </div>
                  <div className="contact-card-action">
                    <button
                      type="button"
                      className={`contact-action-btn ${copiedKey === "phone" ? "copied" : ""}`}
                      onClick={(e) => handleCopy("+201011604114", "phone", e)}
                      title="Copy phone number"
                    >
                      {copiedKey === "phone" ? (
                        <>
                          <CheckIcon /> Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon /> Copy
                        </>
                      )}
                    </button>
                    <ArrowUpRight />
                  </div>
                </a>
              </li>

              {/* Email item */}
              <li>
                <a
                  href="mailto:hello@demo.dentorash.app"
                  className="contact-card-item"
                  aria-label="Email clinic at hello@demo.dentorash.app"
                >
                  <div className="contact-card-main">
                    <div className="contact-icon-bubble">
                      <MailIcon />
                    </div>
                    <div className="contact-card-text">
                      <span className="contact-card-label">Email inquiries</span>
                      <span className="contact-card-value">hello@demo.dentorash.app</span>
                    </div>
                  </div>
                  <div className="contact-card-action">
                    <button
                      type="button"
                      className={`contact-action-btn ${copiedKey === "email" ? "copied" : ""}`}
                      onClick={(e) => handleCopy("hello@demo.dentorash.app", "email", e)}
                      title="Copy email address"
                    >
                      {copiedKey === "email" ? (
                        <>
                          <CheckIcon /> Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon /> Copy
                        </>
                      )}
                    </button>
                    <ArrowUpRight />
                  </div>
                </a>
              </li>

              {/* WhatsApp item */}
              <li>
                <a
                  href="https://wa.me/+201011604114"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card-item"
                  aria-label="Chat on WhatsApp with clinic reception"
                >
                  <div className="contact-card-main">
                    <div className="contact-icon-bubble">
                      <WhatsAppIcon />
                    </div>
                    <div className="contact-card-text">
                      <span className="contact-card-label">
                        WhatsApp Instant <span className="live-badge">Fast reply</span>
                      </span>
                      <span className="contact-card-value">Open WhatsApp Chat</span>
                    </div>
                  </div>
                  <div className="contact-card-action">
                    <ArrowUpRight />
                  </div>
                </a>
              </li>

              {/* Address item */}
              <li>
                <a
                  href={googleMapsSearchUrl("123 Clinic Street, Medical District, Riyadh, Saudi Arabia")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card-item"
                  aria-label="View clinic location on Google Maps"
                >
                  <div className="contact-card-main">
                    <div className="contact-icon-bubble">
                      <MapPinIcon />
                    </div>
                    <div className="contact-card-text">
                      <span className="contact-card-label">Clinic Location</span>
                      <span className="contact-card-value">
                        123 Clinic Street, Medical District, Riyadh, Saudi Arabia
                      </span>
                    </div>
                  </div>
                  <div className="contact-card-action">
                    <ArrowUpRight />
                  </div>
                </a>
              </li>
            </ul>

            {/* Operating Hours & Clinical Notice */}
            <div className="clinic-status-box">
              <div className="clinic-status-header">
                <div className="clinic-status-title">
                  <ClockIcon />
                  <span>Clinical Hours & Schedule</span>
                </div>
                <span className="clinic-status-title">
                  <span className="open-indicator" aria-hidden="true" />
                  <span style={{ fontSize: "0.76rem", color: "var(--clinic-teal-deep)", fontWeight: 700 }}>Open today</span>
                </span>
              </div>
              <p className="clinic-status-desc">
                Appointments are scheduled with generous buffer times between patients so you never feel rushed.
              </p>
              <dl className="clinic-hours-table">
                <dt>Saturday – Thursday</dt>
                <dd>9:00 AM – 7:00 PM</dd>
                <dt>Friday</dt>
                <dd>Closed (Emergency on-call)</dd>
              </dl>
            </div>
          </div>

          {/* Right Column: Interactive Consultation & Contact Form */}
          <div className="contact-form-wrap">
            <form className="contact-form" noValidate onSubmit={handleSubmit}>
              <div className="contact-form-header">
                <h3>Send a message</h3>
                <p>Fill out the form below and our care team will get back to you within 2 business hours.</p>
              </div>

              <label className="field">
                <span>
                  Your full name <span className="required-indicator">Required</span>
                </span>
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  required
                />
              </label>

              <label className="field">
                <span>
                  Email address <span className="required-indicator">Required</span>
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label className="field">
                <span>Phone number (optional)</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+966 50 123 4567"
                />
              </label>

              <label className="field">
                <span>
                  What can we help you with? <span className="required-indicator">Required</span>
                </span>
                <select name="reason" defaultValue="" required>
                  <option value="" disabled>Select inquiry reason</option>
                  <option value="booking">Book a new appointment</option>
                  <option value="consultation">Treatment plan consultation</option>
                  <option value="emergency">Urgent dental issue / toothache</option>
                  <option value="question">General inquiry / billing question</option>
                </select>
              </label>

              <label className="field">
                <span>Message or notes</span>
                <textarea
                  className="resize-none"
                  name="message"
                  rows={4}
                  autoComplete="off"
                  placeholder="How can we assist you today? Please do not enter sensitive private health records."
                />
              </label>

              <button className="button button-primary submit-button" type="submit">
                <span>Submit message preview</span>
                <ArrowUpRight />
              </button>

              <p className="form-footnote">
                <span className="demo-dot" aria-hidden="true" />
                Demo clinic preview · Messages are safe and not transmitted
              </p>

              {submitted && (
                <div className="form-status-banner" role="status" aria-live="polite">
                  <div className="check-bubble">
                    <CheckIcon />
                  </div>
                  <div>
                    <strong>Message received!</strong>
                    <p>Your message preview is ready. In a live clinic deployment, this immediately alerts the reception desk.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}