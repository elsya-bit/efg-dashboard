import Link from "next/link";
import { redirect } from "next/navigation";
import { getUploadsView } from "@/lib/portal";
import { fixturesEnabled } from "@/lib/portal/fixtures-flag";
import { Wordmark } from "@/components/shell/wordmark";
import { BTN_SECONDARY, InternalBadge } from "@/components/ui";
import { PageHeader } from "@/components/shell/placeholder-screen";
import { ToastProvider } from "@/components/toast";
import { AddReport, type SampleFile } from "@/components/ingest/add-report";
import { UploadsManager } from "@/components/ingest/uploads-manager";

const FIXTURE_SAMPLES: SampleFile[] = [
  { label: "Meta Dashboard · 5 Jul", path: "/fixtures/samples/Capital_Transport_Meta_Ads_Dashboard_July2026_MTD_2026-07-05.json" },
  { label: "Daily Tracker · 6 Jul", path: "/fixtures/samples/Capital_Transport_Daily_Budget_Tracker_July2026_2026-07-06.json" },
  { label: "A/B Testing · 6 Jul", path: "/fixtures/samples/CT A-B Testing Log to 6 Jul 2026.json" },
];

export default async function UploadsPage({
  params,
}: {
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const view = await getUploadsView(clientSlug);
  if (view.kind === "redirect") redirect(view.to);
  const { client, clients, uploads } = view;
  const samples = fixturesEnabled() ? FIXTURE_SAMPLES : null;

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <div className="np flex h-[62px] items-center gap-3.5 border-b border-line bg-white px-5">
          <Wordmark />
          <InternalBadge />
          <div className="flex-1" />
          <Link href="/admin" className={BTN_SECONDARY}>
            Admin
          </Link>
          <Link href={`/${client.slug}`} className={BTN_SECONDARY}>
            Open dashboard
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-[18px] px-[30px] pb-[60px] pt-[26px]">
          <PageHeader
            title={`Report uploads · ${client.name}`}
            subtitle="The daily ingestion loop: add the day's JSON export, review what changed, and the dashboard updates."
          />
          <div className="flex flex-wrap gap-1.5">
            {clients.map((c) => (
              <Link
                key={c.id}
                href={`/admin/uploads/${c.slug}`}
                className={`rounded-full border px-3 py-[7px] font-heading text-xs font-semibold ${
                  c.id === client.id
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-primary"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          <UploadsManager
            uploads={uploads}
            addReport={
              <AddReport
                clientId={client.id}
                clientSlug={client.slug}
                samples={samples}
                primary
              />
            }
          />
        </div>
      </div>
    </ToastProvider>
  );
}
