"use client";

import { useState } from "react";
import { fmtIso } from "@/lib/format";
import {
  compareRows,
  uploadSummaryText,
  TYPE_TO_KIND,
  type CompareRow,
} from "@/lib/ingest/core";
import { StatusChip } from "@/components/chips";
import type { UploadRowDb } from "@/lib/portal/types";

/** Prototype typeStyle(): chip colours per upload type. */
function TypeChip({ type }: { type: UploadRowDb["type"] }) {
  const cls =
    type === "meta_dashboard"
      ? "border-line bg-soft text-primary"
      : type === "ab_testing"
        ? "border-line bg-page text-primary"
        : "border-line bg-white text-accent";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-[3px] font-heading text-[11px] font-semibold tracking-[.03em] ${cls}`}
    >
      {TYPE_TO_KIND[type]}
    </span>
  );
}

function UploadRow({ upload }: { upload: UploadRowDb }) {
  const [compareOn, setCompareOn] = useState(false);
  const kind = TYPE_TO_KIND[upload.type];
  const rows: CompareRow[] = upload.prev_summary
    ? compareRows(upload.type, upload.prev_summary, upload.summary)
    : [];

  return (
    <div className="flex flex-col rounded-xl border border-soft">
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-[11px]">
        <TypeChip type={upload.type} />
        <div className="flex min-w-[150px] flex-col gap-px">
          <span className="font-heading text-[13px] font-semibold">
            Data to {fmtIso(upload.as_of)} · v{upload.version}
          </span>
          <span className="break-all text-[11px] text-muted">
            {upload.file_name ?? "—"}
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-[12.5px] text-muted">
          {uploadSummaryText(kind, upload.summary)}
        </span>
        <StatusChip status={upload.status} />
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => setCompareOn((v) => !v)}
            className="rounded-lg border border-line bg-white px-[11px] py-[5px] font-heading text-[11px] font-semibold text-primary"
          >
            {compareOn ? "Hide comparison" : "Compare"}
          </button>
        )}
      </div>
      {compareOn && (
        <div className="flex flex-col gap-[5px] rounded-b-xl border-t border-soft bg-faint px-3.5 py-3">
          <span className="font-heading text-[11px] font-semibold uppercase tracking-[.06em] text-muted">
            What changed · v{upload.version - 1} → v{upload.version}
          </span>
          <div className="flex gap-2.5 pt-[3px] font-heading text-[10.5px] font-semibold uppercase tracking-[.05em] text-muted">
            <span className="flex-[1.4]">Metric</span>
            <span className="flex-1">Previous</span>
            <span className="flex-1">Current</span>
            <span className="flex-1">Change</span>
          </div>
          {rows.map((r) => (
            <div key={r.label} className="flex gap-2.5 py-0.5 text-[12.5px]">
              <span className="flex-[1.4] text-ink">{r.label}</span>
              <span className="flex-1 text-muted">{r.prev}</span>
              <span className="flex-1 font-semibold">{r.cur}</span>
              <span className="flex-1 font-semibold" style={{ color: r.colour }}>
                {r.delta}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The "Report uploads" card from client settings (prototype markup). */
export function UploadsManager({
  uploads,
  addReport,
}: {
  uploads: UploadRowDb[];
  addReport?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-start gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-[15.5px] font-semibold">
            Report uploads
          </span>
          <span className="text-[12.5px] text-muted">
            The team adds the day&apos;s export here. The newest file of each
            type becomes Current and drives the dashboard; the one it replaces
            is archived with a comparison.
          </span>
        </div>
        <div className="flex-1" />
        {addReport}
      </div>
      {uploads.map((u) => (
        <UploadRow key={u.id} upload={u} />
      ))}
      {uploads.length === 0 && (
        <div className="rounded-[10px] bg-page px-3.5 py-3 text-[13px] text-muted">
          No reports added yet for this client. Add the first daily export to
          start the history.
        </div>
      )}
      <span className="text-[11.5px] text-muted">
        Supported: Meta Ads Dashboard, Daily Budget Tracker and A/B Testing Log
        JSON exports — one Current version per type.
      </span>
    </div>
  );
}
