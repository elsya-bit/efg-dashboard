import { redirect } from "next/navigation";
import { getAdminMonthView, getUploadsView } from "@/lib/portal";
import { fixturesEnabled } from "@/lib/portal/fixtures-flag";
import { money2, nextMonthKey } from "@/lib/format";
import { AdminHeader } from "@/components/admin/admin-header";
import { ClientDetailsForm, HistoryRow } from "@/components/admin/settings-form";
import { DeleteClientButton } from "@/components/admin/pipeline-actions";
import { PlanMonthButton } from "@/components/screens/budget-upcoming";
import { AddReport, FIXTURE_SAMPLES } from "@/components/ingest/add-report";
import { UploadsManager } from "@/components/ingest/uploads-manager";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const view = await getAdminMonthView(clientSlug);
  if (view.kind === "redirect") redirect(view.to);
  const { client, clients, months } = view;
  if (client.slug !== clientSlug) redirect(`/admin/settings/${client.slug}`);
  const uploadsView = await getUploadsView(client.slug);
  const uploads = uploadsView.kind === "view" ? uploadsView.uploads : [];

  // lifecycle: Planned = no report; Published = latest reported; Archived = older
  const reportedKeys = months.filter((m) => m.has_report).map((m) => m.key);
  const latestReported = reportedKeys[0];
  const lifecycleFor = (key: string, hasReport: boolean) =>
    !hasReport ? "Planned" : key === latestReported ? "Published" : "Archived";

  const latest = months[0];

  return (
    <>
      <AdminHeader active="settings" clientSlug={client.slug} />
      <div className="flex items-start gap-[18px] max-[960px]:flex-col">
        <div className="flex min-w-0 flex-[1.15] flex-col gap-3.5">
          <ClientDetailsForm client={client} />
          {clients.length > 1 && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-[22px] py-[18px]">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-[13.5px] font-semibold">
                  Remove this client
                </span>
                <span className="text-[12.5px] text-muted">
                  Deletes {client.name} and all their reports from the portal.
                </span>
              </div>
              <div className="flex-1" />
              <DeleteClientButton
                clientSlug={client.slug}
                large
                label="Delete client"
                confirmLabel="Confirm delete"
                afterDelete="pipeline"
              />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-[15.5px] font-semibold">
                  Budget and target history
                </span>
                <span className="text-[12.5px] text-muted">
                  The current month is Published and editable. Past months
                  archive automatically and become read only. Future months are
                  Planned.
                </span>
              </div>
              <div className="flex-1" />
              {latest && (
                <PlanMonthButton
                  clientSlug={client.slug}
                  nextKey={nextMonthKey(latest.key)}
                  defaultBudget={latest.budget ?? 0}
                  defaultTarget={latest.target_cpl ?? 0}
                />
              )}
            </div>
            <div className="flex gap-2.5 px-0.5 pt-1 font-heading text-[10.5px] font-semibold uppercase tracking-[.07em] text-muted">
              <span className="w-[110px] flex-none">Month</span>
              <span className="w-[100px] flex-none">Budget $</span>
              <span className="w-[80px] flex-none">Target $</span>
              <span className="flex-1">Result</span>
            </div>
            {months.map((mo) => {
              const done = (mo.days_elapsed ?? 0) >= (mo.days_in_month ?? 0);
              const resultText = !mo.metrics
                ? "Planned ahead"
                : done
                  ? `${money2(mo.metrics.spend)} spent · ${mo.metrics.leads} leads · $${mo.metrics.cpl.toFixed(2)} CPL`
                  : `In progress · ${money2(mo.metrics.spend)} so far`;
              return (
                <HistoryRow
                  key={mo.key}
                  clientSlug={client.slug}
                  month={mo}
                  lifecycle={lifecycleFor(mo.key, mo.has_report)}
                  resultText={resultText}
                />
              );
            })}
            <span className="text-[11.5px] text-muted">
              Archived months are read only — open them to revisit the report.
              Only planned months can be deleted.
            </span>
          </div>

          <UploadsManager
            uploads={uploads}
            addReport={
              <AddReport
                clientId={client.id}
                clientSlug={client.slug}
                samples={fixturesEnabled() ? FIXTURE_SAMPLES : null}
                primary
              />
            }
          />
        </div>
      </div>
    </>
  );
}
