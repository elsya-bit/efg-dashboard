import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientMonths, getInternalClients } from "@/lib/portal";
import { fmtUpdated, money } from "@/lib/format";
import { StatusChip } from "@/components/chips";
import { AdminHeader } from "@/components/admin/admin-header";
import { AddClientButton } from "@/components/admin/add-client-button";
import { DeleteClientButton } from "@/components/admin/pipeline-actions";

export default async function PipelinePage() {
  const clients = await getInternalClients();
  if (!clients) redirect("/");

  // zero clients (fresh environment): render a recoverable empty state —
  // redirecting anywhere would loop, since every admin page needs a client
  if (clients.length === 0) {
    return (
      <>
        <AdminHeader active="pipeline" clientSlug="" />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-12 text-center">
          <div className="font-heading text-[15.5px] font-semibold text-ink">
            No clients yet
          </div>
          <div className="max-w-md text-[13.5px] leading-relaxed text-muted">
            Create the first client to start the pipeline, or run the seed
            script (<span className="font-mono">npx tsx scripts/seed.ts</span>)
            to load the demo dataset.
          </div>
          <AddClientButton />
        </div>
      </>
    );
  }

  // month summaries only — the pipeline never needs the full report jsonb
  const rows = await Promise.all(
    clients.map(async (c) => {
      const view = await getClientMonths(c.slug);
      const months = view.kind === "months" ? view.months : [];
      const month = months.find((m) => m.has_report) ?? months[0] ?? null;
      return { client: c, month };
    }),
  );

  const count = (status: string) =>
    rows.filter((r) => r.month?.status === status).length;
  const stats = [
    { value: clients.length, label: "clients this month", colour: "#162E27" },
    { value: count("Published"), label: "published", colour: "#1E4D40" },
    { value: count("Approved"), label: "approved, not published", colour: "#2E6B5A" },
    { value: count("Draft"), label: "in draft", colour: "#C53030" },
  ];

  return (
    <>
      <AdminHeader active="pipeline" clientSlug={clients[0].slug} />
      <div className="grid grid-cols-4 gap-3 max-[960px]:grid-cols-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-0.5 rounded-[14px] border border-line bg-white px-4 py-3.5"
          >
            <span
              className="font-heading text-[22px] font-semibold"
              style={{ color: s.colour }}
            >
              {s.value}
            </span>
            <span className="text-xs text-muted">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-line bg-white py-2 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
        <div className="flex items-center gap-2.5 px-5 py-2.5 font-heading text-[10.5px] font-semibold uppercase tracking-[.07em] text-muted">
          <span className="flex-[1.8]">Client</span>
          <span className="flex-[1.1]">Industry</span>
          <span className="flex-[0.7] text-right">Budget</span>
          <span className="flex-[0.7] text-right">Target CPL</span>
          <span className="flex-1">Updated</span>
          <span className="flex-[0.9]">Status</span>
          <span className="flex-[1.2]" />
        </div>
        {rows.map(({ client: c, month }) => (
          <div
            key={c.id}
            className="flex items-center gap-2.5 border-t border-soft px-5 py-[13px] max-[960px]:flex-wrap"
          >
            <span className="flex flex-[1.8] items-center gap-[9px]">
              {c.logo_url ? (
                <span className="inline-flex items-center rounded-lg border border-line bg-white px-2 py-1">
                  <Image
                    src={c.logo_url}
                    alt={c.name}
                    width={64}
                    height={16}
                    className="block h-4 w-auto"
                    unoptimized
                  />
                </span>
              ) : (
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg font-heading text-[11px] font-semibold text-white"
                  style={{ background: c.accent_colour ?? "#4A6B62" }}
                >
                  {c.initials}
                </span>
              )}
              <span className="font-heading text-[13.5px] font-semibold">{c.name}</span>
            </span>
            <span className="flex-[1.1] text-[12.5px] text-muted">{c.industry}</span>
            <span className="flex-[0.7] text-right text-[13px]">
              {money(month?.budget ?? 0)}
            </span>
            <span className="flex-[0.7] text-right text-[13px]">
              ${month?.target_cpl ?? 0}
            </span>
            <span className="flex-1 text-[12.5px] text-muted">
              {month?.updated_at ? fmtUpdated(month.updated_at) : "Planned ahead"}
            </span>
            <span className="flex-[0.9]">
              {month && <StatusChip status={month.status} />}
            </span>
            <span className="flex flex-[1.2] justify-end gap-[7px]">
              <Link
                href={`/admin/desk/${c.slug}`}
                className="rounded-lg border border-primary bg-primary px-[11px] py-1.5 font-heading text-[11.5px] font-semibold text-white"
              >
                Review
              </Link>
              <Link
                href={`/${c.slug}`}
                className="rounded-lg border border-line bg-white px-[11px] py-1.5 font-heading text-[11.5px] font-semibold text-primary"
              >
                Dashboard
              </Link>
              {clients.length > 1 && <DeleteClientButton clientSlug={c.slug} />}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
