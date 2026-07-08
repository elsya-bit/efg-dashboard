import type { ReactNode } from "react";

/**
 * Status chip styles from the prototype's `chip()`/`statusStyle()` helpers.
 * Base: Poppins 600 11px, tracking .03em, 3px 10px padding, pill, 1px border.
 */
const CHIP_BASE =
  "inline-block whitespace-nowrap rounded-full border px-2.5 py-[3px] font-heading text-[11px] font-semibold tracking-[.03em]";

const STATUS_STYLES: Record<string, string> = {
  // prototype statusStyle(): Published & Current are the solid chips; A/B test
  // statuses (Complete/In progress) have their OWN mapping on that screen —
  // anything unknown falls through to the white/muted default, as there.
  Published: "border-primary bg-primary text-white",
  Current: "border-primary bg-primary text-white",
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

/** Named chip visuals used by derived data (metric-card tags etc.). */
export const CHIP_VARIANTS = {
  solid: "border-primary bg-primary text-white",
  soft: "border-line bg-soft text-primary",
  watch: "border-muted bg-white text-muted",
  danger: "border-danger bg-white text-danger",
  faint: "border-line bg-page text-muted",
} as const;

export type ChipVariant = keyof typeof CHIP_VARIANTS;

export function VariantChip({
  variant,
  children,
}: {
  variant: ChipVariant;
  children: ReactNode;
}) {
  return <Chip className={CHIP_VARIANTS[variant]}>{children}</Chip>;
}

/** Prototype healthStyle(): report summary health chip. */
export function HealthChip({ health }: { health: string }) {
  const variant: ChipVariant =
    health === "Strong"
      ? "solid"
      : health === "On Track"
        ? "soft"
        : health === "Watch"
          ? "watch"
          : health === "Needs Attention" || health === "Needs attention"
            ? "danger"
            : "faint";
  return <VariantChip variant={variant}>{health}</VariantChip>;
}

/** Prototype prioStyle(): High / Medium / Low priority chip. */
export function PriorityChip({ priority }: { priority: string }) {
  const className =
    priority === "High"
      ? "border-danger bg-white text-danger"
      : priority === "Medium"
        ? "border-line bg-soft text-primary"
        : "border-line bg-white text-muted";
  return <Chip className={className}>{priority}</Chip>;
}
