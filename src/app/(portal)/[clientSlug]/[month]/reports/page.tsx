import Link from "next/link";
import { getClientMonths } from "@/lib/portal";
import { fmtUpdated, money } from "@/lib/format";
import { StatusChip } from "@/components/chips";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { ExportPdfButton } from "@/components/shell/top-bar-actions";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getClientMonths(clientSlug);
  if (result.kind !== "months") return null;
  const { months } = result;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Each month your EFG team prepares this report, checks it, then publishes it here. Nothing updates behind your back."
      />
      <div className="rounded-2xl border border-line bg-white py-2 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
        {months.map((mo) => {
          const planned = !mo.has_report;
          const mini = planned
            ? `${money(mo.budget ?? 0)} budget · $${mo.target_cpl ?? 0} target CPL`
            : `${mo.metrics!.leads} leads · $${mo.metrics!.cpl} CPL · ${money(mo.metrics!.spend)} spent`;
          return (
            <div
              key={mo.key}
              className="flex flex-wrap items-center gap-3.5 border-t border-soft px-5 py-[15px] first:border-t-0"
            >
              <span className="w-[110px] font-heading text-[14.5px] font-semibold">
                {mo.label}
              </span>
              <StatusChip status={mo.status} />
              <span className="text-[12.5px] text-muted">
                Updated {planned ? "Budget planned ahead" : fmtUpdated(mo.updated_at)}
              </span>
              <span className="text-[12.5px] text-muted">{mini}</span>
              <div className="flex-1" />
              {planned ? (
                <Link
                  href={`/${clientSlug}/${month}/budget?range=upcoming`}
                  className="rounded-[9px] border border-line bg-white px-[13px] py-[7px] font-heading text-xs font-semibold text-primary"
                >
                  Set budget
                </Link>
              ) : (
                <>
                  <Link
                    href={`/${clientSlug}/${mo.key}/overview`}
                    className="rounded-[9px] border border-primary bg-primary px-[13px] py-[7px] font-heading text-xs font-semibold text-white"
                  >
                    Open
                  </Link>
                  <ExportPdfButton />
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
