"use client";

import { useTransition } from "react";
import { useToast } from "@/components/toast";
import { setViewAsClient } from "@/lib/portal/view-as-action";
import { BTN_BACK_INTERNAL, BTN_SECONDARY, BTN_VIEW_AS } from "@/components/ui";

export function ExportPdfButton() {
  return (
    <button type="button" className={BTN_SECONDARY} onClick={() => window.print()}>
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
      className={BTN_VIEW_AS}
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
      className={BTN_BACK_INTERNAL}
      onClick={() => startTransition(() => setViewAsClient(false, clientSlug, monthKey))}
    >
      Back to internal view
    </button>
  );
}
