import Image from "next/image";

interface BrandLogoProps {
  /** `mark` crops the shield only; `full` shows the shield and wordmark. */
  variant?: "full" | "mark";
  className?: string;
  alt?: string;
}

/** Single source of truth for LNS branding in the admin panel. */
export function BrandLogo({ variant = "full", className = "", alt = "LNS" }: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <span className={`relative block shrink-0 overflow-hidden ${className}`}>
        <Image
          src="/lns.svg"
          alt={alt}
          width={255}
          height={77}
          unoptimized
          className="absolute left-0 top-0 h-full w-auto max-w-none"
        />
      </span>
    );
  }

  return (
    <span className={`relative block shrink-0 ${className}`}>
      <Image
        src="/lns.svg"
        alt={alt}
        width={255}
        height={77}
        unoptimized
        className="h-full w-full object-contain"
      />
    </span>
  );
}
