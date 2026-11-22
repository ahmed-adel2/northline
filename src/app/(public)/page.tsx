import "@/app/home.css";
import { AppointmentRequestDemo } from "@/components/public/appointment-request-demo";
import { HomeHeroVideo } from "@/components/public/home-hero-video";
import ToothScroll from "@/components/public/toothScroll";

const services = [
  {
    title: "Preventive care",
    description: "Routine visits and guidance that help keep everyday oral health on track.",
  },
  {
    title: "Restorative dentistry",
    description: "Treatment options discussed clearly, with a plan shaped around each patient.",
  },
  {
    title: "Smile care",
    description: "A considered approach to the appearance and function of your smile.",
  },
];

const careSteps = ["Listen", "Examine", "Plan", "Follow up"];

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 8.2 3 3 6-6.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="plus-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="home-page">
      <div className="demo-banner">
        <span className="demo-dot" aria-hidden="true" />
        Demo clinic · Clinic details, prices, and patient stories are fictional
      </div>

      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Dental care, made <em>clear.</em></h1>
          <p className="hero-description">
            Thoughtful dentistry starts with listening. This example shows how a clinic can
            explain care, choices, and what to do next.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/contact">
              Contact options <ArrowUpRight />
            </a>
            <a className="text-link" href="#care">Explore care <ArrowUp /></a>
          </div>
          <div className="hero-note">
            <span className="note-check"><CheckIcon /></span>
            <span>Clear conversations. Care shaped around you.</span>
          </div>
        </div>

        <HomeHeroVideo />
      </section>

      <section className="visit-strip" aria-label="Appointment card example details">
        <div className="visit-mark"><span><PlusIcon /></span> A FIRST VISIT</div>
        <div className="visit-item"><span>THE START</span><strong>A conversation</strong></div>
        <div className="visit-item"><span>THE FOCUS</span><strong>Your questions first</strong></div>
        <div className="visit-item"><span>THE NEXT STEP</span><strong>Clear options, together</strong></div>
        <a href="/contact" className="button button-primary visit-action">
          Contact options <ArrowUpRight />
        </a>
      </section>

      <section className="care-section section-wrap" id="care" aria-labelledby="care-title">
        <div className="section-intro">
          <div>
            <h2 id="care-title">Good dentistry begins with understanding.</h2>
          </div>
          <p className="section-description">
            Example service descriptions only. A clinic should publish care information reviewed
            by its own team.
          </p>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <a className="service-row" href="/services" key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-arrow"><ArrowUpRight /></span>
            </a>
          ))}
        </div>
      </section>

      <ToothScroll />

      <section className="approach-section" id="approach" aria-labelledby="approach-title">
        <div className="approach-inner">
          <div className="approach-heading">
            <h2 id="approach-title">You stay part of every decision.</h2>
            <p>Care is a conversation, not a checklist. Here is a clear way to think about a visit.</p>
          </div>
          <ol className="care-steps">
            {careSteps.map((step, index) => (
              <li key={step}>
                <span className="step-index">0{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="section-wrap request-wrap">
        <AppointmentRequestDemo />
      </div>
    </div>
  );
}
