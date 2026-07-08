"use client";

import { useEffect, useRef, useState, useTransition } from "react";

/**
 * The prototype's two-step delete: first click arms (danger style), second
 * click within 2.6s confirms; otherwise it disarms. Used for ALL deletes.
 */
export function TwoStepDelete({
  label = "Delete",
  confirmLabel = "Confirm",
  onConfirm,
  className = "",
}: {
  label?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        clearTimeout(timer.current);
        if (armed) {
          setArmed(false);
          startTransition(async () => {
            await onConfirm();
          });
        } else {
          setArmed(true);
          timer.current = setTimeout(() => setArmed(false), 2600);
        }
      }}
      className={`flex-none rounded-[7px] border px-2.5 py-1 font-heading text-[11px] font-semibold disabled:opacity-60 ${
        armed
          ? "border-danger bg-danger text-white"
          : "border-line bg-white text-danger"
      } ${className}`}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
