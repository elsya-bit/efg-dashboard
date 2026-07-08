"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/** Chip nav shown under 960px where the sidebar collapses. */
export function MobileNav({
  clientSlug,
  monthKey,
}: {
  clientSlug: string;
  monthKey: string;
}) {
  const active = useSelectedLayoutSegment() ?? "overview";
  return (
    <div className="np hidden flex-wrap gap-1.5 max-[960px]:flex">
      {NAV_ITEMS.map((n) => {
        const on = active === n.slug;
        return (
          <Link
            key={n.slug}
            href={`/${clientSlug}/${monthKey}/${n.slug}`}
            className={`rounded-full border px-3 py-[7px] font-heading text-xs font-semibold ${
              on
                ? "border-primary bg-primary text-white"
                : "border-line bg-white text-primary"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}
