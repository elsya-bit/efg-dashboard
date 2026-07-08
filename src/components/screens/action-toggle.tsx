"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/toast";
import { toggleActionDone } from "@/lib/portal/month-actions";

/** Mark done / Reopen button on action cards (internal only). */
export function ActionToggle({
  clientSlug,
  monthKey,
  actionId,
  done,
}: {
  clientSlug: string;
  monthKey: string;
  actionId: string;
  done: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleActionDone(clientSlug, monthKey, actionId);
          showToast(result.ok ? result.message : result.error);
          router.refresh();
        })
      }
      className="ml-auto rounded-[7px] border border-line bg-white px-2.5 py-1 font-heading text-[11px] font-semibold text-primary disabled:opacity-60"
    >
      {done ? "Reopen" : "Mark done"}
    </button>
  );
}
