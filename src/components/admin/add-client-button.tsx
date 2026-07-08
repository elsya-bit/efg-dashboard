"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/toast";
import { addClient } from "@/lib/portal/admin-actions";

export function AddClientButton() {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await addClient();
          if (!result.ok) {
            showToast(result.error);
            return;
          }
          showToast("New client created. Fill in their details.");
          router.push(`/admin/settings/${result.slug}`);
        })
      }
      className="rounded-[10px] border border-primary bg-white px-3.5 py-2 font-heading text-[12.5px] font-semibold text-primary disabled:opacity-60"
    >
      Add client
    </button>
  );
}
