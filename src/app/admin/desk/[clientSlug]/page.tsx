import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminMonthView } from "@/lib/portal";
import { fixturesEnabled } from "@/lib/portal/fixtures-flag";
import { derivePacing } from "@/lib/portal/derive";
import { fmtUpdated, money2 } from "@/lib/format";
import { StatusChip } from "@/components/chips";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  DeskActions,
  DeskMonthDelete,
  DeskNotes,
  MonthSetup,
  StatusWorkflow,
} from "@/components/admin/desk-editors";
import { AddReport, FIXTURE_SAMPLES } from "@/components/ingest/add-report";

export default async function DeskPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientSlug: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { clientSlug } = await params;
  const { month: monthParam } = await searchParams;
  const view = await getAdminMonthView(clientSlug, monthParam);
  if (view.kind === "redirect") redirect(view.to);
  const { client, months, month, report } = view;
  if (client.slug !== clientSlug) redirect(`/admin/desk/${client.slug}`);

  const pacing = month && report ? derivePacing(month, report) : null;
  const metrics = report?.metrics;

  return (
    <>
      <AdminHeader active="desk" clientSlug={client.slug} />
      <div className="flex items-start gap-[18px] max-[960px]:flex-col">
        {/* left: preview + ingestion */}
        <div className="flex min-w-0 flex-[1.15] flex-col gap-3">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <div className="flex items-center gap-2.5">
              {client.logo_url ? (
                <span className="inline-flex items-center rounded-[10px] border border-line bg-white px-2.5 py-1.5">
                  <Image
                    src={client.logo_url}
                    alt={client.name}
                    width={88}
                    height={22}
                    className="block h-[22px] w-auto"
                    unoptimized
                  />
                </span>
              ) : (
                <span
                  className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] font-heading text-[13px] font-semibold text-white"
                  style={{ background: client.accent_colour ?? "#4A6B62" }}
                >
                  {client.initials}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-heading text-[15px] font-semibold">
                  {client.name}
                  {month ? ` · ${month.label}` : ""}
                </span>
                <span className="text-xs text-muted">
                  {client.contact
                    ? `Client contact · ${client.contact}${client.contact_role ? `, ${client.contact_role}` : ""}`
                    : "What the client will see"}
                </span>
              </div>
              <div className="flex-1" />
              {month && (
                <Link
                  href={`/${client.slug}/${month.key}/overview`}
                  className="rounded-[9px] border border-line bg-white px-3 py-[7px] font-heading text-xs font-semibold text-primary"
                >
                  Open full preview
                </Link>
              )}
            </div>
            {report?.summary && month && (
              <div className="flex flex-col gap-2.5 rounded-xl border border-soft bg-page p-3.5">
                <div className="flex flex-col gap-[7px] rounded-[10px] bg-primary p-3.5">
                  <span className="font-heading text-[10px] font-semibold uppercase tracking-[.1em] text-line">
                    {month.label} at a glance
                  </span>
                  <span className="text-[13px] leading-normal text-white">
                    {report.summary.text}
                  </span>
                </div>
                {metrics && pacing && (
                  <div className="flex gap-2">
                    {(
                      [
                        ["Spend", money2(metrics.spend)],
                        ["Leads", String(metrics.leads)],
                        ["CPL", `$${metrics.cpl.toFixed(2)}`],
                        [
                          "Pacing",
                          pacing.monthDone
                            ? "100%"
                            : `${pacing.pacePct > 0 ? "+" : ""}${pacing.pacePct}%`,
                        ],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex-1 rounded-[9px] border border-line bg-white p-[9px]"
                      >
                        <div className="text-[10px] text-muted">{label}</div>
                        <div className="font-heading text-sm font-semibold">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
                <span className="text-[11.5px] text-muted">
                  Preview updates live as you edit on the right.
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <div className="flex items-center gap-2">
              <span className="font-heading text-[14.5px] font-semibold">
                Data ingestion
              </span>
              <span className="rounded-full bg-soft px-2.5 py-0.5 font-heading text-[10.5px] font-semibold text-primary">
                Manual · daily
              </span>
            </div>
            <div className="text-[13px] leading-[1.55] text-muted">
              The team adds one export per day per report type. The newest
              upload becomes the Current version and updates this report; the
              file it replaces is archived with a comparison. Manage versions
              under Client settings.
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[12.5px] text-muted">
                Last data · {month?.updated_at ? fmtUpdated(month.updated_at) : "—"}
              </span>
              <div className="flex-1" />
              <AddReport
                clientId={client.id}
                clientSlug={client.slug}
                samples={fixturesEnabled() ? FIXTURE_SAMPLES : null}
                primary
              />
            </div>
          </div>
        </div>

        {/* right: setup, months, editors, workflow */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {month && (
            <MonthSetup
              clientSlug={client.slug}
              monthKey={month.key}
              budget={month.budget ?? 0}
              targetCpl={month.target_cpl ?? 0}
            />
          )}

          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
            <div className="flex items-center gap-2">
              <span className="font-heading text-[14.5px] font-semibold">Months</span>
            </div>
            {months.map((mo) => {
              const reportedCount = months.filter((m) => m.has_report).length;
              const deletable =
                (mo.status === "Draft" || mo.status === "Planned") &&
                !(mo.has_report && reportedCount === 1);
              return (
                <div
                  key={mo.key}
                  className="flex flex-wrap items-center gap-2 rounded-[10px] border border-soft px-2.5 py-[7px]"
                >
                  <span className="min-w-[90px] flex-1 text-[13px] font-bold">
                    {mo.label}
                  </span>
                  <StatusChip status={mo.status} />
                  {mo.has_report && (
                    <Link
                      href={`/admin/desk/${client.slug}?month=${mo.key}`}
                      className="rounded-[7px] border border-line bg-white px-2.5 py-1 font-heading text-[11px] font-semibold text-primary"
                    >
                      Open
                    </Link>
                  )}
                  {deletable && (
                    <DeskMonthDelete clientSlug={client.slug} monthKey={mo.key} />
                  )}
                </div>
              );
            })}
            <span className="text-[11.5px] text-muted">
              Published months are kept as history and cannot be deleted here.
            </span>
          </div>

          {month && report && (
            <>
              <DeskActions
                clientSlug={client.slug}
                monthKey={month.key}
                actions={report.actions ?? []}
              />
              <DeskNotes
                clientSlug={client.slug}
                monthKey={month.key}
                notes={report.notes ?? []}
              />
              <StatusWorkflow
                clientSlug={client.slug}
                monthKey={month.key}
                status={month.status}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
