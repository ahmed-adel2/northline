"use client";

import Link from "next/link";
import "@/app/home.css";
import { PageHeroVisual } from "@/components/public/page-hero-visual";
import { BeforeAfterSlider } from "@/components/public/before-after-slider";

type CaseComparison = {
  title: string;
  description: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
};

const cases: CaseComparison[] = [
  {
    title: "A chipped front tooth",
    description: "Damaged teeth and a bright smile · unrelated Pexels stock photos",
    category: "Restorative",
    beforeImage: "/images/case-photo-before.jpg",
    afterImage: "/images/case-photo-after.jpg",
    beforeLabel: "Before · tooth decay",
    afterLabel: "After · clean smile",
  },
  {
    title: "A smile refreshed",
    description: "Natural smile and veneer models · unrelated Pexels stock photos",
    category: "Restorative & aesthetic",
    beforeImage: "/images/case-2-before.jpg",
    afterImage: "/images/case-2-after.jpg",
    beforeLabel: "Before · natural smile",
    afterLabel: "After · veneer model",
  },
  {
    title: "A first visit",
    description: "Child dental visits · unrelated Pexels stock photos",
    category: "Paediatric",
    beforeImage: "/images/case-3-before.jpg",
    afterImage: "/images/case-3-after.jpg",
    beforeLabel: "First visit",
    afterLabel: "Check-up",
  },
  {
    title: "Gum care",
    description: "Oral exam and dental check · unrelated Pexels stock photos",
    category: "Gum health",
    beforeImage: "/images/case-4-before.jpg",
    afterImage: "/images/case-4-after.jpg",
    beforeLabel: "Gum check",
    afterLabel: "Dental care",
  },
  {
    title: "A more even smile",
    description: "Crooked teeth and a clear aligner · unrelated Pexels stock photos",
    category: "Orthodontic",
    beforeImage: "/images/case-5-before.jpg",
    afterImage: "/images/case-5-after.jpg",
    beforeLabel: "Before · crooked teeth",
    afterLabel: "After · aligner example",
  },
  {
    title: "A worn molar repaired",
    description: "Worn teeth and a crown model · unrelated Pexels stock photos",
    category: "Restorative",
    beforeImage: "/images/case-6-before.jpg",
    afterImage: "/images/case-6-after.jpg",
    beforeLabel: "Before · worn teeth",
    afterLabel: "After · crown model",
  },
];

export default function Cases() {
  return (
    <>
      <div className="demo-banner animate-fade-in-down"><span className="demo-dot" aria-hidden="true" />Demo clinic · Clinic details, prices, and patient stories are fictional</div>
      <section className="page-hero" aria-labelledby="page-title">
        <div className="page-hero-copy">
          <p className="hero-location"><span aria-hidden="true" /> Treated cases</p>
          <h1 id="page-title">Before. After. A clearer picture.</h1>
          <p className="hero-description">Drag each slider to compare the topic-specific stock images.</p>
        </div>
        <PageHeroVisual src="/images/hero-cases.jpg" />
      </section>
      <section className="cases-section section-wrap" aria-labelledby="cases-title">
        <div className="section-intro">
          <div><p className="section-label">Sample cases</p><h2 id="cases-title">Small details. Big difference.</h2></div>
          <p className="section-description">Stock photos illustrate each treatment category. Each side shows a different subject, not a matched patient or treatment result.</p>
        </div>
        <div className="case-grid">{cases.map((c) => <article className="case-card" key={c.title}>
          <BeforeAfterSlider
            title={c.title}
            beforeImage={c.beforeImage}
            afterImage={c.afterImage}
            beforeLabel={c.beforeLabel}
            afterLabel={c.afterLabel}
          />
          <div className="case-card-copy">
            <div className="case-category">{c.category}</div>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <Link href="/contact" className="button-link">Ask about treatment <span aria-hidden="true">↗</span></Link>
          </div>
        </article>)}</div>
        <aside className="cases-care-promise" aria-labelledby="cases-care-title">
          <div>
            <p className="cases-care-label">Care with intention</p>
            <h2 id="cases-care-title">We stand with doctors who listen—and patients who deserve thoughtful care.</h2>
          </div>
          <div>
            <p>Every case deserves clear options, careful planning, and respect at every step.</p>
            <p className="cases-care-note">Sample clinic statement. Customize and verify before publishing.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
