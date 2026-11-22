import Image from "next/image";

type PageHeroVisualProps = {
  src: string;
  className?: string;
};

export function PageHeroVisual({ src, className = "" }: PageHeroVisualProps) {
  return (
    <div className={`page-hero-visual ${className}`} aria-hidden="true">
      <Image
        className="page-hero-image"
        src={src}
        alt=""
        fill
        priority
        sizes="(max-width: 767px) calc(100vw - 2rem), 55vw"
      />
    </div>
  );
}
