import Link from "next/link";
import { redirect } from "next/navigation";
import { getInternalClients, getPortalSession } from "@/lib/portal";
import { Wordmark } from "@/components/shell/wordmark";
import { Chip } from "@/components/chips";
import { BTN_SECONDARY, InternalBadge } from "@/components/ui";
import {
  PageHeader,
  PlaceholderCard,
} from "@/components/shell/placeholder-screen";

async function UploadsClientLinks() {
  const clients = (await getInternalClients()) ?? [];
  if (clients.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {clients.map((c) => (
        <Link
          key={c.id}
          href={`/admin/uploads/${c.slug}`}
          className="rounded-full border border-line bg-white px-3 py-[7px] font-heading text-xs font-semibold text-primary"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login");
  if (session.realRole !== "internal") redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="np flex h-[62px] items-center gap-3.5 border-b border-line bg-white px-5">
        <Wordmark />
        <InternalBadge />
        <div className="flex-1" />
        <Link href="/" className={BTN_SECONDARY}>
          Back to portal
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col gap-[18px] px-[30px] pb-[60px] pt-[26px]">
        <PageHeader
          title="Admin workspace"
          subtitle="Pipeline, review desk and client settings for the EFG team."
        />
        <div className="flex gap-2">
          <Chip className="border-line bg-white text-muted">Pipeline</Chip>
          <Chip className="border-line bg-white text-muted">Review desk</Chip>
          <Chip className="border-line bg-white text-muted">Client settings</Chip>
        </div>
        <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
          <div className="font-heading text-[15.5px] font-semibold">
            Report uploads
          </div>
          <div className="text-[13px] leading-relaxed text-muted">
            Add the day&apos;s JSON exports and review what changed between
            versions. Pick a client:
          </div>
          <UploadsClientLinks />
        </div>
        {session.clientCount === 0 && (
          <div className="rounded-xl border border-dashed border-line bg-faint px-4 py-3 text-[13px] leading-relaxed text-muted">
            No clients are visible to this login yet. If that is unexpected,
            check the memberships table and RLS policies, or run the seed
            script (<span className="font-mono">npx tsx scripts/seed.ts</span>).
          </div>
        )}
        <PlaceholderCard
          phase={6}
          title="The admin workspace is built in Phase 6"
          body="Publish workflow, upload management and client settings land here. Until then, months are published directly in the database."
        />
      </div>
    </div>
  );
}
