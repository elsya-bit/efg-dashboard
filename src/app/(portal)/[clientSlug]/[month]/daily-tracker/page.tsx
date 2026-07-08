import { getScreenData } from "@/lib/portal";
import { deriveTracker, deriveTrackerStats } from "@/lib/portal/derive";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { StatCards } from "@/components/screens/stat-cards";

const HEAD =
  "font-heading text-[10.5px] font-semibold uppercase tracking-[.06em] text-muted";

export default async function DailyTrackerPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null;
  const { shell, report } = result;
  const tracker = deriveTracker(shell.month, report);
  const { stats, planPct } = deriveTrackerStats(shell.month, report);

  return (
    <>
      <PageHeader
        title="Daily budget tracker"
        subtitle={`Spend by state for each day of ${shell.month.label}, straight from the Daily Tracker upload.`}
      />
      {tracker.hasTracker ? (
        <>
          <StatCards stats={stats} />
          <div className="flex flex-col gap-0.5 overflow-x-auto rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <div className={`flex min-w-[900px] gap-2 px-0.5 pb-2 ${HEAD}`}>
              <span className="w-14 flex-none">Date</span>
              <span className="w-[52px] flex-none text-right">VIC</span>
              <span className="w-[52px] flex-none text-right">NSW</span>
              <span className="w-[52px] flex-none text-right">QLD</span>
              <span className="w-[52px] flex-none text-right">SA</span>
              <span className="w-[52px] flex-none text-right">WA</span>
              <span className="w-[52px] flex-none text-right">Boost</span>
              <span className="w-[52px] flex-none text-right">Test</span>
              <span className="min-w-[110px] flex-1" />
              <span className="w-[66px] flex-none text-right">Daily</span>
              <span className="w-[82px] flex-none text-right">MTD</span>
              <span className="w-[82px] flex-none text-right">Remaining</span>
            </div>
            {tracker.rows.map((d) => (
              <div
                key={d.day}
                className="flex min-w-[900px] items-center gap-2 border-t border-soft px-0.5 py-2"
              >
                <span className="w-14 flex-none font-heading text-[12.5px] font-semibold">
                  {d.day}
                </span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.vic}</span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.nsw}</span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.qld}</span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.sa}</span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.wa}</span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.boost}</span>
                <span className="w-[52px] flex-none text-right text-[12.5px]">{d.test}</span>
                <span className="relative block h-3 min-w-[110px] flex-1 rounded-md border border-soft bg-page">
                  <span
                    className="absolute bottom-0 left-0 top-0 block rounded-md bg-primary"
                    style={{ width: `${d.pct}%` }}
                  />
                  <span
                    className="absolute -bottom-0.5 -top-0.5 block w-0.5 bg-ink opacity-50"
                    style={{ left: `${planPct}%` }}
                  />
                </span>
                <span className="w-[66px] flex-none text-right font-heading text-[12.5px] font-semibold">
                  {d.total}
                </span>
                <span className="w-[82px] flex-none text-right text-[12.5px] text-muted">
                  {d.mtd}
                </span>
                <span className="w-[82px] flex-none text-right text-[12.5px] text-muted">
                  {d.left}
                </span>
              </div>
            ))}
            <div className="pt-2 text-[11.5px] text-muted">
              Bars compare each day with the biggest day so far. The tick marks
              the {tracker.dailyTargetText} daily plan. Boost and Test are the
              spike and creative test campaigns.
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-6 text-[13.5px] text-muted">
          No Daily Tracker uploaded for {shell.month.label} yet. The daily view
          starts with the first upload.
        </div>
      )}
    </>
  );
}
