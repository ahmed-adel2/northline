"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Show, UserButton, useUser, useOrganizationList } from "@clerk/nextjs";

function ArrowUpRight() {
  return (
    <svg className="inline-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12 12 4M5 4h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { userMemberships, isLoaded: orgListLoaded } = useOrganizationList({
    userMemberships: true,
  });

  // Read role dynamically from Clerk's organization membership list
  const isAdmin = Boolean(
    orgListLoaded &&
    userMemberships?.data?.some(
      (mem) => mem.role === "org:admin" || mem.role === "admin"
    )
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/team", label: "Team" },
    { href: "/services", label: "Services" },
    { href: "/pricelist", label: "Pricelist" },
    { href: "/cases", label: "Cases" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`} role="banner">
      <Link className="brand" href="/" aria-label="DentoRash demo clinic home">
        <span className="brand-symbol" aria-hidden="true"><BrandSymbol /></span>
        <span className="brand-type">
          <strong>Northline</strong>
          <span>Dental Clinic</span>
        </span>
      </Link>

      <nav id="main-nav" className={`main-nav ${mobileMenuOpen ? "open" : ""}`} aria-label="Main navigation">
        <ul className="nav-list">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isActive ? "active" : ""}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="header-actions">
        <Show
          when="signed-in"
          fallback={
            <Link href="/sign-in" className="button button-header">
              <span>Sign in</span>
              <ArrowUpRight />
            </Link>
          }
        >
          {/* Only rendered if the user has role 'Admin' (org:admin) in an organization */}
          {isAdmin && (
            <Link
              href="/dashboard"
              className="button button-header button-staff-badge"
              title="Open Staff Dashboard"
            >
              <span>Staff Dashboard</span>
              <ArrowUpRight />
            </Link>
          )}

          {/* User profile & Clerk UserButton */}
          <div className="header-user-profile">
            <span className="header-user-name">
              Hello, {user?.firstName || user?.username || "User"}
            </span>
            <UserButton />
          </div>
        </Show>

        <button
          className="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="main-nav"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg className="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="inline-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
