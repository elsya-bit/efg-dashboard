import Link from "next/link";
import type { PortalMonth } from "@/lib/portal/types";

/**
 * Internal-only strip under the top bar when the selected month's report is
 * not yet published.
 */
export function DraftBanner({ month }: { month: PortalMonth }) {
  return (
    <div className="np flex items-center gap-3 bg-ink px-5 py-[9px] text-[13px] text-line">
      <span className="rounded-full border border-muted px-[9px] py-0.5 font-heading text-[11px] font-semibold tracking-[.04em]">
        {month.status}
      </span>
      <span>
        This {month.label} report is not published yet. Clients still see the
        last published month.
      </span>
      <Link
        href="/admin"
        className="ml-auto rounded-lg border border-muted px-[11px] py-[5px] font-heading text-xs font-semibold text-white"
      >
        Open review desk
      </Link>
    </div>
  );
}
