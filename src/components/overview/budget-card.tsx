import Link from "next/link";
import { money, money2 } from "@/lib/format";
import { Chip } from "@/components/chips";
import type { Pacing } from "@/lib/portal/derive";
import type { ReportMetrics } from "@/lib/portal/report-types";

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[110px] flex-1 rounded-[10px] bg-page px-3 py-2.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="font-heading text-base font-semibold">{value}</div>
    </div>
  );
}

/** "Your budget this month" card: progress bar with expected-by-today tick. */
export function BudgetCard({
  pacing,
  metrics,
  base,
}: {
  pacing: Pacing;
  metrics: ReportMetrics;
  base: string;
}) {
  return (
    <div className="flex flex-[1.35] flex-col gap-3.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-center gap-2.5">
        <div className="font-heading text-[15.5px] font-semibold">
          Your budget this month
        </div>
        <span className="text-xs text-muted">Day {pacing.dayOf}</span>
        <div className="flex-1" />
        <Chip
          className={
            pacing.paceOk
              ? "border-line bg-soft text-primary"
              : "border-muted bg-white text-muted"
          }
        >
          {pacing.paceLabel}
        </Chip>
      </div>
      <div className="relative mt-4 h-5 rounded-[10px] border border-line bg-soft">
        <div
          className="absolute bottom-0 left-0 top-0 rounded-[10px] bg-primary"
          style={{ width: pacing.spendPct }}
        />
        <div
          title="Where spend should be today"
          className="absolute -bottom-1.5 -top-1.5 w-0.5 bg-ink opacity-55"
          style={{ left: pacing.expectedPct }}
        />
        <div
          className="absolute -top-[22px] -translate-x-1/2 whitespace-nowrap font-heading text-[10px] font-semibold text-muted"
          style={{ left: pacing.expectedPct }}
        >
          today
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <MiniStat label="Spent so far" value={money2(metrics.spend)} />
        <MiniStat label="Expected by today" value={money2(pacing.expected)} />
        <MiniStat label="Remaining" value={money2(pacing.remaining)} />
        <MiniStat label="Forecast month end" value={money(metrics.forecast)} />
      </div>
      <div className="rounded-[10px] bg-soft px-[13px] py-2.5 text-[13px] leading-[1.55] text-muted">
        <strong className="text-primary">What this means.</strong>{" "}
        {pacing.budgetMeaning}
      </div>
      <Link
        href={`${base}/budget`}
        className="self-start rounded-[9px] border border-line bg-white px-3 py-[7px] font-heading text-xs font-semibold text-primary"
      >
        Full budget view
      </Link>
    </div>
  );
}
