import Link from "next/link";
import { VariantChip } from "@/components/chips";
import type { MetricCard } from "@/lib/portal/derive";

export function MetricCards({
  cards,
  showExplainers = true,
}: {
  cards: MetricCard[];
  showExplainers?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-3 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
      {cards.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-white px-[15px] py-3.5 shadow-[0_1px_2px_rgba(22,46,39,.05)] no-underline hover:border-accent"
        >
          <div className="font-heading text-[10.5px] font-semibold uppercase tracking-[.07em] text-muted">
            {c.label}
          </div>
          <div className="font-heading text-[23px] font-semibold leading-none text-ink">
            {c.value}
          </div>
          <div className="text-[11.5px]" style={{ color: c.deltaColour }}>
            {c.delta}
          </div>
          {showExplainers && (
            <div className="text-[11.5px] leading-[1.45] text-muted">
              {c.meaning}
            </div>
          )}
          <div className="mt-auto">
            <VariantChip variant={c.tagStyle}>{c.tag}</VariantChip>
          </div>
        </Link>
      ))}
    </div>
  );
}
