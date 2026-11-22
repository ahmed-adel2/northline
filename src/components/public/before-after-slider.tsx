"use client";

import Image from "next/image";
import { useState } from "react";

type BeforeAfterSliderProps = {
  title: string;
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
};

export function BeforeAfterSlider({
  title,
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
}: BeforeAfterSliderProps) {
  const [split, setSplit] = useState(50);

  function followPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
    setSplit(Math.max(0, Math.min(100, percentage)));
  }

  return (
    <div
      className="case-gallery"
      role="group"
      aria-label={`${title} before and after comparison`}
      onPointerMove={followPointer}
    >
      <Image className="case-compare-image" src={beforeImage} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 600px" />
      <Image
        className="case-compare-image case-compare-after"
        src={afterImage}
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 600px"
        style={{ clipPath: `inset(0 0 0 ${split}%)` }}
      />
      <span className="case-compare-label case-compare-label-before">{beforeLabel}</span>
      <span className="case-compare-label case-compare-label-after">{afterLabel}</span>
      <span className="case-compare-divider" style={{ left: `${split}%` }} aria-hidden="true">
        <span className="case-compare-handle"><span /></span>
      </span>
      <input
        className="case-compare-input"
        type="range"
        min="0"
        max="100"
        value={split}
        aria-label={`${title}: adjust before and after view`}
        aria-valuetext={`${Math.round(split)}% before, ${100 - Math.round(split)}% after`}
        onChange={(event) => setSplit(Number(event.currentTarget.value))}
      />
    </div>
  );
}
