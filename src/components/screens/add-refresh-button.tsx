"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/toast";
import { addCreativeRefresh } from "@/lib/portal/month-actions";

/** Creative screen: "Add refresh to action plan" for fatiguing creatives. */
export function AddRefreshButton({
  clientSlug,
  monthKey,
  creativeId,
  alreadyAdded,
}: {
  clientSlug: string;
  monthKey: string;
  creativeId: string;
  alreadyAdded: boolean;
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
          const result = await addCreativeRefresh(clientSlug, monthKey, creativeId);
          showToast(result.ok ? result.message : result.error);
          router.refresh();
        })
      }
      className="self-start rounded-[9px] border border-primary bg-white px-3 py-[7px] font-heading text-xs font-semibold text-primary disabled:opacity-60"
    >
      {alreadyAdded ? "Added to plan ✓" : "Add refresh to action plan"}
    </button>
  );
}
