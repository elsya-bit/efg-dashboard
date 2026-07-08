import Image from "next/image";
import { getScreenData } from "@/lib/portal";
import {
  deriveBestWorst,
  deriveCplChart,
  deriveMetricCards,
  derivePacing,
  deriveTracker,
} from "@/lib/portal/derive";
import { HealthChip, StatusChip } from "@/components/chips";
import { HeroCard } from "@/components/overview/hero";
import { MetricCards } from "@/components/overview/metric-cards";
import { BudgetCard } from "@/components/overview/budget-card";
import { CplCard } from "@/components/overview/cpl-card";
import { DailyBudgetCard } from "@/components/overview/daily-budget-card";
import {
  AttentionWorking,
  ChangedCard,
  NotesCard,
} from "@/components/overview/lists";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null; // layout handles redirects
  const { shell, report } = result;
  const { client, month: m } = shell;
  const base = `/${client.slug}/${m.key}`;
  const internalView = shell.effectiveRole === "internal";

  const meta = [
    client.industry,
    client.objective,
    client.manager ? `Managed by ${client.manager}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const pacing = derivePacing(m, report);
  const cards = report.metrics
    ? deriveMetricCards(m, report, pacing, base)
    : [];
  const chart = deriveCplChart(m, report);
  const { best, worst } = deriveBestWorst(report);
  const tracker = deriveTracker(m, report);

  return (
    <>
      {/* client identity row */}
      <div className="flex flex-wrap items-center gap-3.5">
        {client.logo_url ? (
          <>
            <div className="flex items-center rounded-[13px] border border-line bg-white px-4 py-2.5">
              <Image
                src={client.logo_url}
                alt={client.name}
                width={140}
                height={36}
                className="block h-9 w-auto"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[13px] text-muted">{meta}</div>
            </div>
          </>
        ) : (
          <>
            <div
              className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] font-heading text-[17px] font-semibold text-white"
              style={{ background: client.accent_colour ?? "#4A6B62" }}
            >
              {client.initials}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="font-heading text-[21px] font-semibold leading-[1.15]">
                {client.name}
              </div>
              <div className="text-[13px] text-muted">{meta}</div>
            </div>
          </>
        )}
        <div className="flex-1" />
        <div className="flex flex-wrap items-center gap-2">
          {report.summary && <HealthChip health={report.summary.health} />}
          <StatusChip status={m.status} />
        </div>
      </div>

      {report.summary && (
        <HeroCard monthLabel={m.label} summary={report.summary} base={base} />
      )}

      {cards.length > 0 && <MetricCards cards={cards} />}

      {report.metrics && (
        <div className="flex items-stretch gap-[18px] max-[960px]:flex-col">
          <BudgetCard pacing={pacing} metrics={report.metrics} base={base} />
          <CplCard
            cpl={report.metrics.cpl}
            target={m.target_cpl ?? 0}
            chart={chart}
            best={best}
            worst={worst}
          />
        </div>
      )}

      {tracker.hasTracker && <DailyBudgetCard tracker={tracker} base={base} />}

      <AttentionWorking
        attention={report.attention ?? []}
        working={report.working ?? []}
      />

      <ChangedCard changed={report.changed ?? []} />

      <NotesCard notes={report.notes ?? []} internalView={internalView} />
    </>
  );
}
