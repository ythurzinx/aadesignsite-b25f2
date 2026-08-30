import Image from "next/image";

export function Brand({ logoUrl, compact = false }: { logoUrl?: string | null; compact?: boolean }) {
  const source = logoUrl || (compact ? "/brand/aa-mark.png" : "/brand/aa-logo-full.png");
  return (
    <span className={`brand-glow relative block ${compact ? "h-11 w-[3.9rem]" : "h-11 w-[10.5rem] sm:h-12 sm:w-[11.5rem]"}`} aria-label="AA Design & Media">
      <Image src={source} alt="AA Design & Media" fill sizes={compact ? "64px" : "184px"} className="object-contain object-left saturate-[1.04]" priority />
    </span>
  );
}
