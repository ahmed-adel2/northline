"use client";

import { useEffect, useRef } from "react";

export function HomeHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isVisible = false;

    const syncPlayback = () => {
      if (!isVisible || document.hidden) {
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
    video.addEventListener("canplay", syncPlayback);
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.removeEventListener("canplay", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <div className="hero-visual hero-video">
      <video
        ref={videoRef}
        className="hero-illustration"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
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
