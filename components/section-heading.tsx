import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  light = false,
  aside
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
      <div className="max-w-4xl">
        <span className={`eyebrow ${light ? "text-white" : "text-[#0077b8]"}`}>{eyebrow}</span>
        <h2 className={`display mt-6 text-[clamp(2.7rem,5.7vw,5.5rem)] font-bold leading-[0.98] ${light ? "text-white" : "text-[#102a43]"}`}>
          {title}
        </h2>
        {copy && <p className={`mt-6 max-w-2xl text-[0.95rem] leading-7 sm:text-base ${light ? "text-white/65" : "text-[#627d98]"}`}>{copy}</p>}
      </div>
      {aside}
    </div>
  );
}
