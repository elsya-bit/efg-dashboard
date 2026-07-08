import { getScreenData } from "@/lib/portal";
import { money2 } from "@/lib/format";
import { Chip } from "@/components/chips";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { StatCards } from "@/components/screens/stat-cards";
import type { AbTest } from "@/lib/portal/report-types";

function VerdictChip({ verdict }: { verdict: AbTest["verdict"] }) {
  if (verdict === "winner") {
    return <Chip className="border-primary bg-primary text-white">Winner found</Chip>;
  }
  if (verdict === "data") {
    return <Chip className="border-muted bg-white text-muted">Needs more data</Chip>;
  }
  return <Chip className="border-line bg-page text-muted">No clear winner</Chip>;
}

/** A/B test status: Complete soft, In progress solid (prototype line 1697). */
function TestStatusChip({ status }: { status: AbTest["status"] }) {
  return status === "Complete" ? (
    <Chip className="border-line bg-soft text-primary">Complete</Chip>
  ) : (
    <Chip className="border-primary bg-primary text-white">In progress</Chip>
  );
}

function TestCard({ test, internalView }: { test: AbTest; internalView: boolean }) {
  const maxCpr = test.variants.reduce((mx, v) => Math.max(mx, v.cpr), 0) || 1;
  const meta =
    [test.group, test.campaign].filter(Boolean).join(" · ") +
    (test.confidence ? ` · ${test.confidence}` : "");
  const clientOn = !!test.client && test.client !== test.conclusion;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex flex-wrap items-start gap-2">
        <div className="flex min-w-[220px] flex-1 flex-col gap-0.5">
          <span className="font-heading text-[15.5px] font-semibold">{test.name}</span>
          <span className="text-xs text-muted">{meta}</span>
        </div>
        <VerdictChip verdict={test.verdict} />
        <TestStatusChip status={test.status} />
      </div>
      {clientOn && (
        <div className="text-[13px] leading-[1.55] text-muted">{test.client}</div>
      )}
      {test.variants.length > 0 && (
        // scrolls inside the card on narrow screens instead of overflowing the page
        <div className="flex flex-col overflow-x-auto">
          <div className="flex gap-2.5 px-0.5 pb-[7px] font-heading text-[10.5px] font-semibold uppercase tracking-[.06em] text-muted">
            <span className="min-w-[170px] flex-[1.6]">Variant</span>
            <span className="min-w-[90px] flex-1">Cost per result</span>
            <span className="w-16 flex-none" />
            <span className="w-[70px] flex-none text-right">Spend</span>
            <span className="w-14 flex-none text-right">Results</span>
            <span className="w-12 flex-none text-right">CTR</span>
            <span className="w-11 flex-none text-right">Freq</span>
            <span className="w-[86px] flex-none" />
          </div>
          {test.variants.map((v) => {
            const isBest = !!test.best && v.ad === test.best;
            const isWorst =
              !!test.worst && v.ad === test.worst && test.variants.length > 1 && !isBest;
            return (
              <div
                key={v.name + v.ad}
                className="flex items-center gap-2.5 border-t border-soft px-0.5 py-[9px]"
              >
                <div className="flex min-w-[170px] flex-[1.6] flex-col gap-px">
                  <span className="font-heading text-[13px] font-semibold">{v.name}</span>
                  {!!v.ad && v.ad !== v.name && (
                    <span className="text-[11.5px] text-muted">{v.ad}</span>
                  )}
                </div>
                <span className="relative block h-3 min-w-[90px] flex-1 rounded-md border border-soft bg-page">
                  <span
                    className="absolute bottom-0 left-0 top-0 block rounded-md"
                    style={{
                      width: `${Math.max(6, Math.round((v.cpr / maxCpr) * 100))}%`,
                      background: isBest ? "#1E4D40" : "#A7CCC1",
                    }}
                  />
                </span>
                <span className="w-16 flex-none text-right font-heading text-[13px] font-semibold">
                  ${v.cpr.toFixed(2)}
                </span>
                <span className="w-[70px] flex-none text-right text-[12.5px]">
                  {money2(v.spend)}
                </span>
                <span className="w-14 flex-none text-right text-[12.5px]">{v.results}</span>
                <span className="w-12 flex-none text-right text-[12.5px]">{v.ctr}%</span>
                <span className="w-11 flex-none text-right text-[12.5px]">
                  {v.freq.toFixed(1)}
                </span>
                <span className="flex w-[86px] flex-none justify-end">
                  {isBest &&
                    (test.verdict === "winner" ? (
                      <Chip className="border-primary bg-primary text-white">Winner</Chip>
                    ) : (
                      <Chip className="border-line bg-soft text-primary">Lowest cost</Chip>
                    ))}
                  {isWorst && (
                    <span className="font-heading text-[10.5px] font-semibold text-danger">
                      Highest cost
                    </span>
                  )}
                </span>
              </div>
            );
          })}
          <div className="pt-2 text-[11.5px] text-muted">
            Test total · {money2(test.spend)} spend · {test.results} results · $
            {test.avg.toFixed(2)} average cost per result · shorter bar = cheaper
            result
          </div>
        </div>
      )}
      <div className="rounded-[10px] bg-soft px-[13px] py-[9px] text-[13px] leading-[1.55]">
        <strong className="text-primary">Conclusion.</strong> {test.conclusion}
      </div>
      <div className="rounded-[10px] bg-page px-[13px] py-[9px] text-[13px] leading-[1.55]">
        <strong className="text-primary">Next step.</strong> {test.next}
      </div>
      {internalView && test.reasoning && (
        <div className="rounded-[10px] border border-dashed border-line px-[13px] py-[9px] text-[12.5px] leading-[1.55] text-muted">
          <strong className="text-primary">How the log reads it · internal.</strong>{" "}
          {test.reasoning}
        </div>
      )}
    </div>
  );
}

export default async function AbTestingPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null;
  const { shell, report } = result;
  const internalView = shell.effectiveRole === "internal";
  const abLog = report.ab_log ?? null;

  return (
    <>
      <PageHeader
        title="A/B testing"
        subtitle={
          abLog
            ? `From the A/B Testing Log upload · ${abLog.windowText}`
            : "What we are testing, what is winning, and what happens next."
        }
      />
      {abLog ? (
        <>
          <StatCards
            stats={[
              { label: "Tests detected", value: String(abLog.summary.detected) },
              { label: "With a verdict", value: String(abLog.summary.completed) },
              { label: "Still gathering data", value: String(abLog.summary.gathering) },
              { label: "Target cost per result", value: `$${abLog.target.toFixed(2)}` },
            ]}
          />
          <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white px-5 py-4 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <span className="font-heading text-[11px] font-semibold uppercase tracking-[.06em] text-muted">
              Across all tests
            </span>
            <span className="text-[13.5px] leading-[1.6]">{abLog.summary.text}</span>
          </div>
          {abLog.tests.map((t) => (
            <TestCard key={t.id} test={t} internalView={internalView} />
          ))}
        </>
      ) : (
        <div className="rounded-2xl border border-line bg-white p-6 text-[13.5px] text-muted">
          No A/B Testing Log for {shell.month.label} yet. Add one under Client
          settings → Report uploads and this page fills in automatically.
        </div>
      )}
    </>
  );
}
