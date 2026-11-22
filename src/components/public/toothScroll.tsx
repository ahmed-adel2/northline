"use client";

import { useEffect, useRef } from "react";
import "./toothScroll.css";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function ToothScroll() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        let raf = 0;

        const update = () => {
            const r = el.getBoundingClientRect();
            const total = r.height - window.innerHeight;
            const p = clamp(-r.top / total); // 0 -> 1 across the section
            const enter = clamp(p / 0.4); // right -> middle during first half
            const clean = clamp(p / 0.7); // dirty -> clean
            const shine = clamp((p - 0.65) / 0.2);
            const name = clamp((p - 0.6) / 0.3); // final sparkle
            el.style.setProperty("--enter", String(1 - (1 - enter) ** 3));
            el.style.setProperty("--move", String(p));
            el.style.setProperty("--clean", String(clean));
            el.style.setProperty("--shine", String(shine));
            el.style.setProperty("--name", String(1 - (1 - name) ** 3));
        };
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <section ref={sectionRef} className="tooth-section">
            <h2 className="tooth-title">A clean tooth is a happy tooth</h2>
            <div className="tooth-stage">
                <div className="tooth-wrap">
                    <svg viewBox="0 0 200 260" className="tooth-svg" role="img" aria-label="Illustration of a tooth being cleaned">
                        <defs>
                            <linearGradient id="enamel" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#ffffff" />
                                <stop offset="1" stopColor="#dfe9f2" />
                            </linearGradient>
                            <clipPath id="toothClip">
                                <path id="toothPath" d="M100 22c-16-14-52-18-68 8-14 24-4 52 4 80 8 30 4 64 18 100 6 14 22 12 26-4 6-24 10-48 20-48s14 24 20 48c4 16 20 18 26 4 14-36 10-70 18-100 8-28 18-56 4-80-16-26-52-22-68-8z" />
                            </clipPath>
                        </defs>

                        <path d="M100 22c-16-14-52-18-68 8-14 24-4 52 4 80 8 30 4 64 18 100 6 14 22 12 26-4 6-24 10-48 20-48s14 24 20 48c4 16 20 18 26 4 14-36 10-70 18-100 8-28 18-56 4-80-16-26-52-22-68-8z"
                            fill="url(#enamel)" className="tooth-body" />

                        <g clipPath="url(#toothClip)">
                            <g className="dirt">
                                <rect width="200" height="260" fill="#b8892b" opacity=".55" />
                                <circle cx="70" cy="70" r="22" fill="#6b4a14" opacity=".7" />
                                <circle cx="130" cy="100" r="18" fill="#5a3d10" opacity=".7" />
                                <circle cx="95" cy="150" r="26" fill="#7a5518" opacity=".6" />
                                <circle cx="60" cy="130" r="12" fill="#4a3210" opacity=".7" />
                                <circle cx="140" cy="170" r="14" fill="#6b4a14" opacity=".6" />
                            </g>
                            <ellipse className="gloss" cx="70" cy="70" rx="14" ry="42" fill="#fff" transform="rotate(20 70 70)" />
                        </g>

                        <g className="sparkle" transform="translate(42 44)">
                            <path d="M0-18 L3.5-3.5 L18 0 L3.5 3.5 L0 18 L-3.5 3.5 L-18 0 L-3.5-3.5Z" fill="#fff" />
                        </g>
                    </svg>
                </div>
                <h2 className="clinic-name">Northline</h2>
            </div>
        </section>
    );
}
