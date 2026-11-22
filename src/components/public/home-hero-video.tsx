"use client";

import { useEffect, useRef } from "react";

export function HomeHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isVisible = false;

    const syncPlayback = () => {
      if (!isVisible || document.hidden || motionPreference.matches) {
        video.pause();
        return;
      }

      void video.play().catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("The home introduction video could not play.", error);
        }
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        syncPlayback();
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    motionPreference.addEventListener("change", syncPlayback);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motionPreference.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <div className="hero-visual hero-video">
      <video
        ref={videoRef}
        className="hero-illustration"
        muted
        playsInline
        preload="metadata"
        poster="/images/clinic-intro-poster.jpg"
        aria-label="A cinematic introduction to the clinic"
      >
        <source src="/videos/clinic-intro.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-shade" aria-hidden="true" />
      <div className="visual-badge"><span className="video-pulse" aria-hidden="true" /> A calmer kind of care</div>
    </div>
  );
}
