import { getScreenData } from "@/lib/portal";
import { money2 } from "@/lib/format";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { CampaignsTable } from "@/components/screens/campaigns-table";

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getScreenData(clientSlug, month);
  if (result.kind !== "shell") return null;
  const { shell, report } = result;
  const target = shell.month.target_cpl ?? 0;
  const audiences = report.audiences ?? [];

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle={`Every campaign that ran in ${shell.month.label}. Click a row for quality notes and what we are doing about it.`}
      />
      <CampaignsTable campaigns={report.campaigns ?? []} targetCpl={target} />
      <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
        <div className="mb-1.5 font-heading text-[15.5px] font-semibold">
          Audiences
        </div>
        {audiences.map((au) => (
          <div
            key={au.name}
            className="flex flex-wrap items-center gap-3 border-t border-soft px-0.5 py-2.5"
          >
            <span className="min-w-[180px] flex-[1.6] font-heading text-[13px] font-semibold">
              {au.name}
            </span>
            <span className="w-[90px] text-[12.5px] text-muted">
              {money2(au.spend)} spent
            </span>
            <span className="w-[70px] text-[12.5px] text-muted">
              {au.leads} leads
            </span>
            <span
              className="w-[70px] font-heading text-[13px] font-semibold"
              style={{ color: au.cpl > target ? "#C53030" : "#162E27" }}
            >
              ${au.cpl.toFixed(2)}
            </span>
            <span className="min-w-[200px] flex-[2] text-[12.5px] text-muted">
              {au.note}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
