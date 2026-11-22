"use client";

import { useState, type FormEvent } from "react";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppointmentRequestDemo() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
  }

  return (
    <section className="request-section" id="appointment-request" aria-labelledby="request-title">
      <div className="request-copy">
        <h2 id="request-title">Start with a conversation.</h2>
        <p>Preview how an appointment request could look. This demo does not send or save your information.</p>
        <p className="privacy-note">Use fictional details only. Do not enter real contact or health information.</p>
      </div>
      <form className="request-form" noValidate onSubmit={handleSubmit}>
        <div className="form-heading">
          <span className="form-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M16 3.5c-2.2 0-3.7 1.1-5.7 1.1-1.7 0-3.4-.8-5.1.1-2 1.1-2.2 4.2-1.7 7.2.8 4.9 3.5 13.8 6.2 16.1 1.5 1.3 2.8.2 3.4-2.2.7-2.7 1-5.1 2.9-5.1s2.2 2.4 2.9 5.1c.6 2.4 1.9 3.5 3.4 2.2 2.7-2.3 5.4-11.2 6.2-16.1.5-3 .3-6.1-1.7-7.2-1.7-.9-3.4-.1-5.1-.1-2 0-3.5-1.1-5.7-1.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M16 8v8m-4-4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>
          <div><h3>Appointment request preview</h3><p>Fictional clinic details</p></div>
          <span className="demo-chip">Demo</span>
        </div>
        <label className="field">
          <span>Your name <span className="required-indicator">(required)</span></span>
          <input name="name" autoComplete="off" placeholder="Fictional name" required />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Preferred contact <span className="required-indicator">(required)</span></span>
            <select name="contact-method" defaultValue="" required>
              <option value="" disabled>Select one</option><option value="phone">Phone</option><option value="email">Email</option>
            </select>
          </label>
          <label className="field">
            <span>Preferred day</span>
            <select name="day" defaultValue=""><option value="">No preference</option><option value="weekday">Weekday</option><option value="weekend">Weekend</option></select>
          </label>
        </div>
        <button className="button button-primary submit-button" type="submit">Preview request <ArrowUpRight /></button>
        <p className="form-footnote">Demo only · Nothing is sent or saved</p>
        <p className="form-status" aria-live="polite" role="status">{submitted ? "Request preview ready. Nothing was sent or saved." : ""}</p>
      </form>
    </section>
  );
}
