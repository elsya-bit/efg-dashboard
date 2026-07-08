"use client";

import { useTransition } from "react";
import { useToast } from "@/components/toast";
import { setViewAsClient } from "@/lib/portal/view-as-action";

const buttonClass =
  "rounded-[10px] border border-line bg-white px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary";

export function AddReportButton() {
  const showToast = useToast();
  return (
    <button
      type="button"
      className={buttonClass}
      onClick={() => showToast("Report uploads arrive in Phase 4.")}
    >
      Add report
    </button>
  );
}

export function ExportPdfButton() {
  return (
    <button type="button" className={buttonClass} onClick={() => window.print()}>
      Export PDF
    </button>
  );
}

export function ViewAsClientButton({
  clientSlug,
  clientName,
  monthKey,
}: {
  clientSlug: string;
  clientName: string;
  monthKey: string;
}) {
  const showToast = useToast();
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="rounded-[10px] border border-primary bg-white px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary"
      onClick={() => {
        showToast(`Viewing as ${clientName}. Internal details are hidden.`);
        startTransition(() => setViewAsClient(true, clientSlug, monthKey));
      }}
    >
      View as client
    </button>
  );
}

export function BackToInternalButton({
  clientSlug,
  monthKey,
}: {
  clientSlug: string;
  monthKey: string;
}) {
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="rounded-[10px] border border-dashed border-muted bg-soft px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary"
      onClick={() => startTransition(() => setViewAsClient(false, clientSlug, monthKey))}
    >
      Back to internal view
    </button>
  );
}
