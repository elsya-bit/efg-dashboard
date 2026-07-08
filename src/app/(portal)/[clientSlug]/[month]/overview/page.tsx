import Image from "next/image";
import { getPortalShell } from "@/lib/portal";
import { StatusChip } from "@/components/chips";
import { PlaceholderCard } from "@/components/shell/placeholder-screen";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ clientSlug: string; month: string }>;
}) {
  const { clientSlug, month } = await params;
  const result = await getPortalShell(clientSlug, month);
  if (result.kind !== "shell") return null; // layout handles redirects
  const { client, month: m } = result.shell;
  const meta = [
    client.industry,
    client.objective,
    client.manager ? `Managed by ${client.manager}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
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
          <StatusChip status={m.status} />
        </div>
      </div>
      <PlaceholderCard phase={3} />
    </>
  );
}
