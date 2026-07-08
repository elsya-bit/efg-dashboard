"use client";

import { useState } from "react";
import { money2 } from "@/lib/format";
import { Chip } from "@/components/chips";
import type { ReportCampaign } from "@/lib/portal/report-types";

/** Prototype campHealthStyle(). */
function HealthChip({ campaign }: { campaign: ReportCampaign }) {
  const cls =
    campaign.health === "strong"
      ? "border-primary bg-primary text-white"
      : campaign.health === "attention"
        ? "border-danger bg-white text-danger"
        : "border-line bg-soft text-primary";
  return <Chip className={cls}>{campaign.healthLabel}</Chip>;
}

export function CampaignsTable({
  campaigns,
  targetCpl,
}: {
  campaigns: ReportCampaign[];
  targetCpl: number;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="rounded-2xl border border-line bg-white py-2 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-center gap-2.5 px-5 py-2.5 font-heading text-[10.5px] font-semibold uppercase tracking-[.07em] text-muted">
        <span className="flex-[2.2]">Campaign</span>
        <span className="flex-[0.9]">Status</span>
        <span className="flex-[0.8] text-right">Spend</span>
        <span className="flex-[0.7] text-right">Leads</span>
        <span className="flex-[0.7] text-right">CPL</span>
        <span className="flex-[0.7] text-right">CTR</span>
        <span className="flex-[0.7] text-right">CPC</span>
        <span className="flex-[1.1] text-right">Health</span>
        <span className="w-[22px]" />
      </div>
      {campaigns.map((cp) => {
        const open = !!expanded[cp.id];
        return (
          <div key={cp.id} className="border-t border-soft">
            <div
              className="flex cursor-pointer items-center gap-2.5 px-5 py-[13px] hover:bg-page"
              onClick={() => setExpanded((s) => ({ ...s, [cp.id]: !s[cp.id] }))}
            >
              <span className="flex flex-[2.2] flex-col gap-px">
                <span className="font-heading text-[13.5px] font-semibold">
                  {cp.name}
                </span>
                <span className="text-[11.5px] text-muted">{cp.objective}</span>
              </span>
              <span className="flex-[0.9]">
                <Chip
                  className={
                    cp.status === "Active"
                      ? "border-line bg-soft text-primary"
                      : "border-line bg-page text-muted"
                  }
                >
                  {cp.status}
                </Chip>
              </span>
              <span className="flex-[0.8] text-right text-[13.5px]">
                {money2(cp.spend)}
              </span>
              <span className="flex-[0.7] text-right text-[13.5px]">{cp.leads}</span>
              <span
                className="flex-[0.7] text-right font-heading text-[13.5px] font-semibold"
                style={{ color: cp.cpl > targetCpl ? "#C53030" : "#162E27" }}
              >
                ${cp.cpl.toFixed(2)}
              </span>
              <span className="flex-[0.7] text-right text-[13.5px] text-muted">
                {cp.ctr}%
              </span>
              <span className="flex-[0.7] text-right text-[13.5px] text-muted">
                ${cp.cpc.toFixed(2)}
              </span>
              <span className="flex flex-[1.1] justify-end">
                <HealthChip campaign={cp} />
              </span>
              <span className="w-[22px] text-center text-xs text-muted">
                {open ? "▴" : "▾"}
              </span>
            </div>
            {open && (
              <div className="mx-5 mb-3.5 flex gap-3.5 rounded-xl bg-soft px-4 py-3.5 max-[960px]:flex-col">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-[.07em] text-primary">
                    Result quality
                  </span>
                  <span className="text-[13.5px] leading-[1.55]">{cp.quality}</span>
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-heading text-[11px] font-semibold uppercase tracking-[.07em] text-primary">
                    Action
                  </span>
                  <span className="text-[13.5px] leading-[1.55]">{cp.action}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
