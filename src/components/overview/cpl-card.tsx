import { Chip } from "@/components/chips";
import type { CplChart } from "@/lib/portal/derive";

/** "Cost per lead" card: big value vs target, daily CPL bars, dashed target line. */
export function CplCard({
  cpl,
  target,
  chart,
  best,
  worst,
}: {
  cpl: number;
  target: number;
  chart: CplChart;
  best: string;
  worst: string;
}) {
  const under = cpl <= target;
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-center gap-2.5">
        <div className="font-heading text-[15.5px] font-semibold">Cost per lead</div>
        <div className="flex-1" />
        <Chip
          className={
            under
              ? "border-primary bg-primary text-white"
              : "border-danger bg-white text-danger"
          }
        >
          {under
            ? `$${(target - cpl).toFixed(2)} under target`
            : `$${(cpl - target).toFixed(2)} over target`}
        </Chip>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="font-heading text-[34px] font-semibold leading-none">
          ${cpl.toFixed(2)}
        </span>
        <span className="text-[13px] text-muted">
          against your ${target.toFixed(2)} target
        </span>
      </div>
      <div className="relative flex h-[108px] items-end gap-2 px-1">
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-ink opacity-45"
          style={{ bottom: chart.targetLineBottom }}
        />
        <div
          className="absolute right-0.5 font-heading text-[10px] font-semibold text-muted"
          style={{ bottom: chart.targetLineLabelBottom }}
        >
          target ${target.toFixed(2)}
        </div>
        {chart.bars.map((b) => (
          <div
            key={b.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-[5px]"
          >
            <div className="text-[10.5px] text-muted">${b.val}</div>
            <div
              className="w-full max-w-[34px] rounded-t-[7px] rounded-b-[3px]"
              style={{ height: b.h, background: b.bg }}
            />
            <div className="whitespace-nowrap text-[10px] text-muted">{b.label}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-lg bg-soft px-2.5 py-[5px]">Best · {best}</span>
        <span className="rounded-lg bg-page px-2.5 py-[5px]">Dearest · {worst}</span>
      </div>
    </div>
  );
}
