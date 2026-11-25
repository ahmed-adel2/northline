import Link from "next/link";
import { googleMapsSearchUrl } from "@/lib/google-maps";

function ArrowUp() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandSymbol() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 3.5c-2.2 0-3.7 1.1-5.7 1.1-1.7 0-3.4-.8-5.1.1-2 1.1-2.2 4.2-1.7 7.2.8 4.9 3.5 13.8 6.2 16.1 1.5 1.3 2.8.2 3.4-2.2.7-2.7 1-5.1 2.9-5.1s2.2 2.4 2.9 5.1c.6 2.4 1.9 3.5 3.4 2.2 2.7-2.3 5.4-11.2 6.2-16.1.5-3 .3-6.1-1.7-7.2-1.7-.9-3.4-.1-5.1-.1-2 0-3.5-1.1-5.7-1.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 8v8m-4-4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="footer-social-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M18 10a8 8 0 1 0-9.25 7.9v-5.59H6.72V10h2.03V8.24c0-2.01 1.2-3.12 3.03-3.12.88 0 1.8.16 1.8.16v1.98h-1.01c-.99 0-1.3.62-1.3 1.25V10h2.23l-.36 2.31h-1.87v5.59A8 8 0 0 0 18 10Z" fill="currentColor" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="footer-social-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="15" height="15" rx="4.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14.6" cy="5.4" r="1" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="footer-social-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.75 3.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM1.75 6.75h3v10h-3v-10Zm5 0h2.88v1.37h.04c.4-.76 1.38-1.56 2.85-1.56 3.05 0 3.61 2.01 3.61 4.62v5.57h-3v-4.94c0-1.18-.02-2.7-1.64-2.7-1.65 0-1.9 1.29-1.9 2.62v5.02h-3v-10Z" fill="currentColor" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="footer-social-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 4.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 14V6A1.5 1.5 0 0 1 3 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m2 5.5 8 5.5 8-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2.5" />
    </svg>
  );
}

const footerLinks = [
  { href: "/about", label: "About Northline" },
  { href: "/team", label: "Medical Team" },
  { href: "/services", label: "Services & Care" },
  { href: "/pricelist", label: "Transparent Pricelist" },
  { href: "/cases", label: "Clinical Cases" },
  { href: "/testimonials", label: "Patient Reviews" },
];

const baseSocialLinks = [
  { href: "https://facebook.com", label: "Facebook", ariaLabel: "Visit Northline on Facebook", icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", ariaLabel: "Visit Northline on Instagram", icon: InstagramIcon },
  { href: "https://linkedin.com", label: "LinkedIn", ariaLabel: "Visit Northline on LinkedIn", icon: LinkedInIcon },
];

export function SiteFooter({
  showPricelist,
  openingHours,
  clinicName = "Northline Dental Clinic",
  address = "1 Tahrir Square, Downtown, Cairo, Egypt",
  phone = "+201011604114",
  email = "hello@northline.clinic",
}: {
  showPricelist: boolean;
  openingHours: { day: string; from: string; to: string; open: boolean }[];
  clinicName?: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  const waNumber = phone.replace(/[^0-9]/g, "");
  const socialLinks = [
    ...baseSocialLinks,
    { href: `mailto:${email}`, label: "Email Us", ariaLabel: "Email our care team", icon: MailIcon },
    { href: `https://wa.me/${waNumber}`, label: "WhatsApp", ariaLabel: `Chat with ${clinicName} on WhatsApp`, icon: WhatsAppIcon },
  ];
  const visibleFooterLinks = footerLinks.filter((link) => showPricelist || link.href !== "/pricelist");
  const hoursSummary = openingHours
    .filter((hour) => hour.open)
    .map((hour) => hour.day.slice(0, 3))
    .join(" · ");
  return (
    <footer className="site-footer" role="contentinfo">
      {/* Bold Hero Action Bar / Quick Booking Banner */}
      <div className="footer-banner-cta">
        <div className="footer-banner-copy">
          <h2 className="footer-banner-title">
            Exceptional dental care, crafted with <em>precision & empathy.</em>
          </h2>
          <p className="footer-banner-desc">
            Book your consultation today or explore our clinical approach designed around clear communication.
          </p>
        </div>
        <div className="footer-banner-actions">
          <Link href="/contact" className="button button-primary footer-cta-btn">
            Request consultation <ArrowUpRight />
          </Link>
          <a href={`tel:${phone}`} className="button footer-phone-btn">
            {phone}
          </a>
        </div>
      </div>

      <div className="footer-grid">
        {/* Brand & Clinic Statement Column */}
        <div className="footer-brand-col">
          <Link className="brand footer-brand" href="/" aria-label="Northline Dental Clinic Home">
            <span className="brand-symbol" aria-hidden="true"><BrandSymbol /></span>
            <span className="brand-type">
              <strong>Northline</strong>
              <span>Dental Clinic</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Northline is a modern dental practice dedicated to evidence-based preventive, restorative, and aesthetic oral healthcare.
          </p>

          <div className="footer-clinic-highlight">
            <span className="highlight-label">Hours of Operation</span>
            <p className="highlight-value hours-summary">{hoursSummary}</p>
            <span className="highlight-sub">Emergency support available on call 24/7</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-col">
          <h3 className="footer-col-title">Navigation</h3>
          <nav className="footer-nav" aria-label="Footer navigation">
            <ul className="footer-link-list">
              {visibleFooterLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link-item">
                    <span>{link.label}</span>
                    <span className="footer-link-arrow" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contact Details Column */}
        <div className="footer-col footer-contact">
          <h3 className="footer-col-title">Clinic Details</h3>
          <address className="footer-address">
            <div className="footer-address-item">
              <span className="address-label">Location</span>
              <p>
                <a
                  href={googleMapsSearchUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link font-wrap"
                >
                  {address}
                </a>
              </p>
            </div>
            <div className="footer-address-item">
              <span className="address-label">Direct Lines</span>
              <p>
                <a href={`tel:${phone}`} className="footer-contact-link">{phone}</a>
              </p>
              <p>
                <a href={`mailto:${email}`} className="footer-contact-link">{email}</a>
              </p>
            </div>
          </address>
        </div>

        {/* Connect & Portal Column */}
        <div className="footer-col footer-social">
          <h3 className="footer-col-title">Connect & Portal</h3>
          <p className="footer-col-desc">
            Stay updated with oral wellness tips, clinical case updates, and community news.
          </p>
          <ul className="social-list" aria-label="Social media links">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.ariaLabel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-button"
                  >
                    <Icon />
                    <span>{social.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="copyright-group">
          <p className="copyright">
            © Northline Dental Clinic
          </p>
          <p className="copyright-sub">
            All Rights Reserved. Designed &amp; Developed by <a href="https://rashads-web-dev.vercel.app" className="font-bold text-green-500 hover:text-blue-700" target="_blank" rel="noopener noreferrer">Rashad&apos;s Web Dev</a>.
          </p>
        </div>
        <a href="#page-top" className="back-top" aria-label="Back to the top of this page">
          <span>Back to top</span>
          <span className="back-top-circle" aria-hidden="true">
            <ArrowUp />
          </span>
        </a>
      </div>
    </footer>
  );
}
