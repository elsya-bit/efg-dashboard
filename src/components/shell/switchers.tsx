"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import type { PortalClient, PortalMonth } from "@/lib/portal/types";

export function ClientSwitcher({
  clients,
  activeSlug,
}: {
  clients: PortalClient[];
  activeSlug: string;
}) {
  const router = useRouter();
  return (
    <select
      value={activeSlug}
      onChange={(e) => router.push(`/${e.target.value}`)}
      aria-label="Switch client"
      className="max-w-[200px] rounded-[10px] border border-line bg-white px-2.5 py-[7px] text-[13.5px] font-bold"
    >
      {clients.map((c) => (
        <option key={c.id} value={c.slug}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

export function MonthSwitcher({
  months,
  activeKey,
  clientSlug,
  showStatus,
}: {
  months: PortalMonth[];
  activeKey: string;
  clientSlug: string;
  /** Internal view appends ' · Status' to each option. */
  showStatus: boolean;
}) {
  const router = useRouter();
  const screen = useSelectedLayoutSegment() ?? "overview";
  return (
    <select
      value={activeKey}
      onChange={(e) => router.push(`/${clientSlug}/${e.target.value}/${screen}`)}
      aria-label="Switch month"
      className="rounded-[10px] border border-line bg-white px-2.5 py-[7px] text-[13px]"
    >
      {months.map((m) => (
        <option key={m.key} value={m.key}>
          {m.label + (showStatus ? ` · ${m.status}` : "")}
        </option>
      ))}
    </select>
  );
}
