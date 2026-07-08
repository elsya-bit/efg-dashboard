import { getScreenData } from "@/lib/portal";
import { Chip } from "@/components/chips";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { AddRefreshButton } from "@/components/screens/add-refresh-button";
import type { ReportCreative } from "@/lib/portal/report-types";

/** Prototype tagStyleFor(): best solid, fatigue danger-outline, else faint. */
function CreativeTag({ creative }: { creative: ReportCreative }) {
  const cls =
    creative.tag === "best"
      ? "border-primary bg-primary text-white"
      : creative.tag === "fatigue"
        ? "border-danger bg-white text-danger"
        : "border-line bg-page text-muted";
  return <Chip className={`self-start ${cls}`}>{creative.tagLabel}</Chip>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[9px] bg-page px-2.5 py-2">
      <div className="text-[10.5px] text-muted">{label}</div>
      <div className="font-heading text-[15px] font-semibold">{value}</div>
    </div>
  );
}

export default async function CreativePage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null;
  const { shell, report } = result;
  const internalView = shell.effectiveRole === "internal";
  const autoAdded = new Set(
    (report.actions ?? [])
      .map((a) => (a as { _auto?: string })._auto)
      .filter(Boolean),
  );

  return (
    <>
      <PageHeader
        title="Creative performance"
        subtitle={`Which ads are earning their keep in ${shell.month.label}, and which need a rest.`}
      />
      <div className="grid grid-cols-3 items-start gap-3.5 max-[960px]:grid-cols-2 max-[560px]:grid-cols-1">
        {(report.creatives ?? []).map((cr) => (
          <div
            key={cr.id}
            className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]"
          >
            <CreativeTag creative={cr} />
            <div className="flex flex-col gap-0.5">
              <div className="font-heading text-[15px] font-semibold">{cr.name}</div>
              <div className="text-xs text-muted">{cr.type}</div>
            </div>
            <div className="flex gap-2">
              <MiniStat label="CPL" value={`$${cr.cpl}`} />
              <MiniStat label="CTR" value={`${cr.ctr}%`} />
              <MiniStat label="Frequency" value={String(cr.freq)} />
            </div>
            <div className="text-[13px] leading-[1.55] text-ink">
              <strong className="mb-[3px] block font-heading text-[11px] font-semibold uppercase tracking-[.06em] text-primary">
                What we see
              </strong>
              {cr.note}
            </div>
            <div className="rounded-[10px] bg-soft px-3 py-2.5 text-[13px] leading-[1.55] text-ink">
              <strong className="mb-[3px] block font-heading text-[11px] font-semibold uppercase tracking-[.06em] text-primary">
                Recommended next step
              </strong>
              {cr.rec}
            </div>
            {cr.tag === "fatigue" && internalView && (
              <AddRefreshButton
                clientSlug={clientSlug}
                monthKey={month}
                creativeId={cr.id}
                alreadyAdded={autoAdded.has(cr.id)}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
