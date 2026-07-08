import Link from "next/link";
import type { ReportSummary } from "@/lib/portal/report-types";

/** The "{Month} at a glance" hero briefing card. */
export function HeroCard({
  monthLabel,
  summary,
  base,
}: {
  monthLabel: string;
  summary: ReportSummary;
  base: string;
}) {
  return (
    <div className="flex gap-6 rounded-[18px] bg-primary p-6 px-[26px] shadow-[0_6px_18px_rgba(22,46,39,.14)] max-[960px]:flex-col">
      <div className="flex min-w-0 flex-[1.5] flex-col gap-3">
        <div className="font-heading text-[11px] font-semibold uppercase tracking-[.12em] text-line">
          {monthLabel} at a glance
        </div>
        <div className="font-heading text-[19px] font-medium leading-[1.5] text-white [text-wrap:pretty]">
          {summary.text}
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.pills.map((p) => (
            <span
              key={p}
              className="rounded-full border border-[rgba(208,232,226,.35)] bg-[rgba(230,243,240,.14)] px-3 py-[5px] font-heading text-xs font-semibold text-soft"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
      <div className="flex min-w-[230px] flex-1 flex-col gap-[9px] rounded-[14px] border border-[rgba(208,232,226,.28)] bg-[rgba(230,243,240,.1)] px-[18px] py-4">
        <div className="font-heading text-[11px] font-semibold uppercase tracking-[.12em] text-line">
          Recommended next step
        </div>
        <div className="text-[14.5px] leading-[1.55] text-white [text-wrap:pretty]">
          {summary.recommendation}
        </div>
        <div className="flex-1" />
        <Link
          href={`${base}/actions`}
          className="self-start rounded-[10px] bg-white px-3.5 py-2 font-heading text-[12.5px] font-semibold text-primary"
        >
          See the action plan
        </Link>
      </div>
    </div>
  );
}
