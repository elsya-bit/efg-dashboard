"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { TwoStepDelete } from "@/components/two-step-delete";
import { deleteClient } from "@/lib/portal/admin-actions";

export function DeleteClientButton({
  clientSlug,
  large = false,
  label = "Delete",
  confirmLabel = "Confirm",
  afterDelete = "stay",
}: {
  clientSlug: string;
  large?: boolean;
  label?: string;
  confirmLabel?: string;
  afterDelete?: "stay" | "pipeline";
}) {
  const router = useRouter();
  const showToast = useToast();
  return (
    <TwoStepDelete
      label={label}
      confirmLabel={confirmLabel}
      className={large ? "!px-4 !py-[9px] !text-[13px] !rounded-[10px]" : ""}
      onConfirm={async () => {
        const result = await deleteClient(clientSlug);
        showToast(result.ok ? result.message : result.error);
        if (result.ok && afterDelete === "pipeline") {
          router.push("/admin/pipeline");
        }
        router.refresh();
      }}
    />
  );
}
