"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({
  clientSlug,
  monthKey,
  managerName,
}: {
  clientSlug: string;
  monthKey: string;
  managerName: string | null;
}) {
  const active = useSelectedLayoutSegment() ?? "overview";
  return (
    <div className="np flex w-[210px] flex-none flex-col gap-1 bg-ink px-3 py-[18px] max-[960px]:hidden">
      <div className="px-2.5 pb-2 font-heading text-[10.5px] font-semibold uppercase tracking-[.1em] text-muted">
        Your report
      </div>
      {NAV_ITEMS.map((n) => {
        const on = active === n.slug;
        return (
          <Link
            key={n.slug}
            href={`/${clientSlug}/${monthKey}/${n.slug}`}
            className={`rounded-[10px] px-3 py-[9px] font-heading text-[13px] ${
              on
                ? "bg-primary font-semibold text-white"
                : "font-medium text-line"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
      <div className="flex-1" />
      <div className="flex flex-col gap-1.5 rounded-xl bg-primary p-[13px]">
        <div className="font-heading text-[12.5px] font-semibold text-white">
          Your EFG contact
        </div>
        <div className="text-[12.5px] text-line">{managerName ?? "EFG team"}</div>
        <a
          href="mailto:contact@efgconsulting.com.au"
          className="mt-1 rounded-lg bg-white py-[7px] text-center font-heading text-xs font-semibold text-primary no-underline"
        >
          Send a message
        </a>
      </div>
      <div className="px-2.5 pt-3 text-[10.5px] text-muted">
        The team behind your team
      </div>
    </div>
  );
}
