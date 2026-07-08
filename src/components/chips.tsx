import type { ReactNode } from "react";

/**
 * Status chip styles from the prototype's `chip()`/`statusStyle()` helpers.
 * Base: Poppins 600 11px, tracking .03em, 3px 10px padding, pill, 1px border.
 */
const CHIP_BASE =
  "inline-block whitespace-nowrap rounded-full border px-2.5 py-[3px] font-heading text-[11px] font-semibold tracking-[.03em]";

const STATUS_STYLES: Record<string, string> = {
  // Published / Current / Complete share the solid style
  Published: "border-primary bg-primary text-white",
  Current: "border-primary bg-primary text-white",
  Complete: "border-primary bg-primary text-white",
  Approved: "border-line bg-soft text-primary",
  Planned: "border-line bg-page text-accent",
  Archived: "border-line bg-page text-muted",
};

export function StatusChip({ status }: { status: string }) {
  return (
    <span
      className={`${CHIP_BASE} ${STATUS_STYLES[status] ?? "border-line bg-white text-muted"}`}
    >
      {status}
    </span>
  );
}

/** Escape hatch for one-off chips; pass the colour classes directly. */
export function Chip({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return <span className={`${CHIP_BASE} ${className}`}>{children}</span>;
}
