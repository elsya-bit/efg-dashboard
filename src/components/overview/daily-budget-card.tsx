import Link from "next/link";
import type { TrackerView } from "@/lib/portal/derive";

const HEAD =
  "font-heading text-[10.5px] font-semibold uppercase tracking-[.06em] text-muted";

/** "Daily budget · last 7 days" numeric table from the Daily Tracker upload. */
export function DailyBudgetCard({
  tracker,
  base,
}: {
  tracker: TrackerView;
  base: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="font-heading text-[15.5px] font-semibold">
          Daily budget · last 7 days
        </div>
        <span className="text-xs text-muted">
          What each state campaign spent, day by day · plan is{" "}
          {tracker.dailyTargetText} a day
        </span>
        <div className="flex-1" />
        {tracker.moreCount > 0 && (
          <Link
            href={`${base}/daily-tracker`}
            className="rounded-[9px] border border-line bg-white px-3 py-[7px] font-heading text-xs font-semibold text-primary"
          >
            View all {tracker.moreCount} days
          </Link>
        )}
      </div>
      <div className="flex flex-col overflow-x-auto">
        <div className={`flex min-w-[640px] gap-2 px-0.5 pb-[7px] ${HEAD}`}>
          <span className="w-14 flex-none">Date</span>
          <span className="min-w-[52px] flex-1 text-right">VIC</span>
          <span className="min-w-[52px] flex-1 text-right">NSW</span>
          <span className="min-w-[52px] flex-1 text-right">QLD</span>
          <span className="min-w-[52px] flex-1 text-right">SA</span>
          <span className="min-w-[52px] flex-1 text-right">WA</span>
          <span className="min-w-[52px] flex-1 text-right">Boost</span>
          <span className="min-w-[52px] flex-1 text-right">Test</span>
          <span className="w-[72px] flex-none text-right">Daily total</span>
          <span className="w-[84px] flex-none text-right">MTD</span>
        </div>
        {tracker.recent.map((d) => (
          <div
            key={d.day}
            className="flex min-w-[640px] items-center gap-2 border-t border-soft px-0.5 py-2"
          >
            <span className="w-14 flex-none font-heading text-[12.5px] font-semibold">
              {d.day}
            </span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.vic}</span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.nsw}</span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.qld}</span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.sa}</span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.wa}</span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.boost}</span>
            <span className="min-w-[52px] flex-1 text-right text-[12.5px]">{d.test}</span>
            <span className="w-[72px] flex-none text-right font-heading text-[12.5px] font-semibold">
              {d.total}
            </span>
            <span className="w-[84px] flex-none text-right text-[12.5px] text-muted">
              {d.mtd}
            </span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted">
        From the Daily Tracker upload · data to {tracker.asOf} · state by state
        breakdown in{" "}
        <Link
          href={`${base}/daily-tracker`}
          className="font-semibold text-primary"
        >
          Daily Tracker
        </Link>
      </div>
    </div>
  );
}
