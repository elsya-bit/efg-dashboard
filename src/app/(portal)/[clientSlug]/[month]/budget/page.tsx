import Link from "next/link";
import { getClientMonths, getScreenData } from "@/lib/portal";
import {
  deriveBudgetBars,
  deriveHistoryRows,
  derivePacing,
  deriveRangeStats,
} from "@/lib/portal/derive";
import { nextMonthKey } from "@/lib/format";
import { Chip } from "@/components/chips";
import { PageHeader } from "@/components/shell/placeholder-screen";
import {
  PlanMonthButton,
  UpcomingRow,
} from "@/components/screens/budget-upcoming";

type Range = "month" | "quarter" | "history" | "upcoming";

const RANGE_CHIPS: Array<{ key: Range; label: string }> = [
  { key: "month", label: "This month" },
  { key: "quarter", label: "Last 3 months" },
  { key: "history", label: "All history" },
  { key: "upcoming", label: "Upcoming" },
];

export default async function BudgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { clientSlug, month } = await params;
  const rangeParam = (await searchParams).range;
  const range: Range = (["month", "quarter", "history", "upcoming"] as const).includes(
    rangeParam as Range,
  )
    ? (rangeParam as Range)
    : "month";

  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null;
  const { shell, report } = result;
  const monthsResult = await getClientMonths(clientSlug);
  if (monthsResult.kind !== "months") return null;
  const allMonths = monthsResult.months;
  const internalView = shell.effectiveRole === "internal";

  const pacing = derivePacing(shell.month, report);
  const bars = deriveBudgetBars(shell.month, report, pacing);

  const reported = allMonths.filter((mo) => mo.metrics);
  const rangeMonths = range === "quarter" ? reported.slice(0, 3) : reported;
  const historyRows = deriveHistoryRows(rangeMonths);
  const { stats, caption } = deriveRangeStats(rangeMonths);

  const planned = allMonths
    .filter((mo) => !mo.has_report)
    .sort((a, b) => a.key.localeCompare(b.key));
  const latestKey = allMonths[0]?.key ?? shell.month.key;
  const latest = allMonths[0];

  const subtitle =
    range === "month"
      ? `${shell.month.label} · Day ${shell.month.days_elapsed} of ${shell.month.days_in_month} · ${pacing.paceLabel}`
      : range === "quarter"
        ? "Your last three reported months side by side"
        : range === "history"
          ? "Every month EFG has reported for you"
          : "Budgets planned ahead. Reporting starts when the month begins.";

  return (
    <>
      <PageHeader title="Budget" subtitle={subtitle} />
      <div className="flex flex-wrap gap-2">
        {RANGE_CHIPS.map((rc) => (
          <Link
            key={rc.key}
            href={`/${clientSlug}/${month}/budget${rc.key === "month" ? "" : `?range=${rc.key}`}`}
            className={`rounded-full border px-3.5 py-[7px] font-heading text-xs font-semibold ${
              range === rc.key
                ? "border-primary bg-primary text-white"
                : "border-line bg-white text-primary"
            }`}
          >
            {rc.label}
          </Link>
        ))}
      </div>

      {range === "month" && (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
          {bars.map((r) => (
            <div key={r.label} className="flex flex-col gap-[5px]">
              <div className="flex justify-between text-[12.5px] text-muted">
                <span className="font-heading font-semibold text-ink">{r.label}</span>
                <span className="font-heading font-semibold text-ink">{r.valText}</span>
              </div>
              <div className="relative h-4 rounded-lg border border-soft bg-page">
                <div
                  className="absolute bottom-0 left-0 top-0 rounded-lg"
                  style={{ width: r.w, background: r.bg, border: r.border }}
                />
              </div>
              <div className="text-xs text-muted">{r.sub}</div>
            </div>
          ))}
          <div className="rounded-xl bg-soft px-4 py-3.5 text-[13.5px] leading-[1.6] text-ink">
            <strong className="text-primary">What this means.</strong>{" "}
            {pacing.budgetMeaning} {pacing.budgetMeaning2}
          </div>
        </div>
      )}

      {(range === "quarter" || range === "history") && (
        <div className="flex flex-col gap-3.5">
          <div className="grid grid-cols-4 gap-3 max-[560px]:grid-cols-1">
            {stats.map((rs) => (
              <div
                key={rs.label}
                className="flex flex-col gap-0.5 rounded-[14px] border border-line bg-white px-4 py-3.5"
              >
                <span
                  className="font-heading text-[22px] font-semibold"
                  style={{ color: rs.colour }}
                >
                  {rs.value}
                </span>
                <span className="text-xs text-muted">{rs.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-line bg-white py-3.5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <div className="px-5 pb-2 text-[12.5px] text-muted">{caption}</div>
            {historyRows.map((h) => (
              <Link
                key={h.key}
                href={`/${clientSlug}/${h.key}/budget`}
                className="flex flex-wrap items-center gap-3.5 border-t border-soft px-5 py-[13px] hover:bg-page"
              >
                <span className="w-[110px] flex-none font-heading text-[13.5px] font-semibold">
                  {h.label}
                </span>
                <Chip
                  className={
                    h.stateOk === null
                      ? "border-line bg-white text-muted"
                      : h.stateOk
                        ? "border-line bg-soft text-primary"
                        : "border-danger bg-white text-danger"
                  }
                >
                  {h.stateChip}
                </Chip>
                <span className="relative h-3 min-w-[140px] flex-1 rounded-md border border-soft bg-page">
                  <span
                    className="absolute bottom-0 left-0 top-0 rounded-md"
                    style={{ width: h.pct, background: h.barBg }}
                  />
                </span>
                <span className="w-[150px] text-[12.5px] text-muted">{h.spendOf}</span>
                <span className="w-[70px] text-[12.5px] text-muted">{h.leads}</span>
                <Chip
                  className={
                    h.cplOk
                      ? "border-line bg-soft text-primary"
                      : "border-danger bg-white text-danger"
                  }
                >
                  {h.cplChip}
                </Chip>
              </Link>
            ))}
          </div>
          <div className="pl-0.5 text-[12.5px] text-muted">
            Click a month to open its detailed view. Budgets and CPL targets are
            set per month, so each row compares against the target that applied
            at the time.
          </div>
        </div>
      )}

      {range === "upcoming" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
          <div className="flex items-center gap-2">
            <span className="font-heading text-[15.5px] font-semibold">
              Upcoming budgets
            </span>
            <div className="flex-1" />
            {internalView && latest && (
              <PlanMonthButton
                clientSlug={clientSlug}
                nextKey={nextMonthKey(latestKey)}
                defaultBudget={latest.budget ?? 0}
                defaultTarget={latest.target_cpl ?? 0}
              />
            )}
          </div>
          <div className="text-[13px] leading-[1.55] text-muted">
            Budgets and CPL targets can be set ahead of time. When the month
            begins, spend tracking starts and your EFG team prepares the first
            report.
          </div>
          {planned.map((mo) => (
            <UpcomingRow
              key={mo.key}
              clientSlug={clientSlug}
              month={mo}
              editable={internalView}
            />
          ))}
          {planned.length === 0 && (
            <div className="rounded-[10px] bg-page px-3.5 py-3 text-[13px] text-muted">
              No upcoming budgets set yet. Create the next month to plan ahead.
            </div>
          )}
        </div>
      )}
    </>
  );
}
