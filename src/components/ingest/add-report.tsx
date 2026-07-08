"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/toast";
import { ingestReport } from "@/lib/ingest/action";
import {
  detectAndParse,
  isParseError,
  uploadSummaryText,
  type ParsedUpload,
  type UploadKind,
} from "@/lib/ingest/core";

const KINDS: UploadKind[] = ["Meta Dashboard", "Daily Tracker", "A/B Testing"];

/** Dev-fixture sample files (served from /fixtures/samples in fixture mode). */
export type SampleFile = { label: string; path: string };

export const FIXTURE_SAMPLES: SampleFile[] = [
  { label: "Meta Dashboard · 5 Jul", path: "/fixtures/samples/Capital_Transport_Meta_Ads_Dashboard_July2026_MTD_2026-07-05.json" },
  { label: "Daily Tracker · 6 Jul", path: "/fixtures/samples/Capital_Transport_Daily_Budget_Tracker_July2026_2026-07-06.json" },
  { label: "A/B Testing · 6 Jul", path: "/fixtures/samples/CT A-B Testing Log to 6 Jul 2026.json" },
];

/**
 * "Add report" button + the prototype's upload dialog. After a successful
 * ingest, navigates to the affected month's overview (prototype behaviour).
 */
export function AddReport({
  clientId,
  clientSlug,
  samples,
  primary = false,
}: {
  clientId: string;
  clientSlug: string;
  samples: SampleFile[] | null;
  /** true → solid primary button (uploads manager), false → top-bar style. */
  primary?: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<UploadKind>("Meta Dashboard");
  const [fileName, setFileName] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedUpload | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setFileName("");
    setRawText("");
    setParsed(null);
    setError("");
  };

  const ingestText = (text: string, name: string) => {
    setFileName(name);
    setRawText(text);
    const p = detectAndParse(text);
    if (isParseError(p)) {
      setParsed(null);
      setError(p.error);
      return;
    }
    setParsed(p);
    setKind(p.kind);
    setError("");
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => ingestText(String(reader.result), f.name);
    reader.readAsText(f);
  };

  const loadSample = async (s: SampleFile) => {
    try {
      const res = await fetch(encodeURI(s.path));
      if (!res.ok) throw new Error("http");
      ingestText(await res.text(), s.path.split("/").pop()!);
    } catch {
      setError("Could not load the sample file.");
    }
  };

  const confirm = () => {
    if (!parsed) {
      showToast("Choose a JSON export first.");
      return;
    }
    startTransition(async () => {
      const result = await ingestReport(clientId, clientSlug, fileName, rawText);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      showToast(result.message);
      // note: no router.refresh() here — it would race with (and cancel)
      // the pending push; the pushed route re-renders server-side anyway
      router.push(`/${clientSlug}/${result.monthKey}/overview`);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          primary
            ? "flex-none rounded-[9px] bg-primary px-[13px] py-[7px] font-heading text-xs font-semibold text-white"
            : "rounded-[10px] border border-line bg-white px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary"
        }
      >
        Add report
      </button>
      {open && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-[rgba(22,46,39,.45)]"
          onClick={() => {
            setOpen(false);
            reset();
          }}
        >
          <div
            className="flex w-[min(440px,92vw)] flex-col gap-[13px] rounded-2xl bg-white p-[22px] shadow-[0_24px_64px_rgba(22,46,39,.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-[3px]">
              <span className="font-heading text-[16.5px] font-semibold">
                Add a report
              </span>
              <span className="text-[12.5px] leading-normal text-muted">
                Upload the day&apos;s JSON export. It becomes the Current
                version for its type and updates the dashboard; the version it
                replaces is archived with a comparison.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-[13px] py-[7px] font-heading text-xs font-semibold ${
                    kind === k
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-white text-primary"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
              Report file (.json)
              <input
                type="file"
                accept=".json,application/json"
                onChange={onFile}
                className="text-[12.5px] font-normal text-ink"
              />
            </label>
            {samples && samples.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Or use a sample:</span>
                {samples.map((s) => (
                  <button
                    key={s.path}
                    type="button"
                    onClick={() => loadSample(s)}
                    className="rounded-lg border border-line bg-white px-2.5 py-[5px] font-heading text-[11.5px] font-semibold text-primary"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            {parsed && (
              <div className="rounded-[10px] border border-line bg-soft px-3 py-2.5 text-[12.5px] leading-normal text-primary">
                <strong>{fileName}</strong>
                <br />
                {parsed.kind} · data to {parsed.asOf} ·{" "}
                {uploadSummaryText(parsed.kind, parsed.summary)}
              </div>
            )}
            {error && (
              <div className="rounded-[10px] border border-danger bg-white px-3 py-2.5 text-[12.5px] text-danger">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-[9px] border border-line bg-white px-3.5 py-2 font-heading text-[12.5px] font-semibold text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="rounded-[9px] border border-primary bg-primary px-3.5 py-2 font-heading text-[12.5px] font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save as Current"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
