"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { TwoStepDelete } from "@/components/two-step-delete";
import { deletePlan, planMonth, updatePlan } from "@/lib/portal/month-actions";
import { monthName, money } from "@/lib/format";
import type { PortalMonth } from "@/lib/portal/types";

/** One editable Planned-month row (internal) per the prototype's upcomingRows. */
export function UpcomingRow({
  clientSlug,
  month,
  editable,
}: {
  clientSlug: string;
  month: PortalMonth;
  editable: boolean;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [, startTransition] = useTransition();

  const commit = (field: "budget" | "target", raw: string) => {
    const v = field === "budget" ? parseInt(raw, 10) : parseFloat(raw);
    if (isNaN(v) || v < 0) return;
    const value = field === "budget" ? v : Math.round(v * 100) / 100;
    startTransition(async () => {
      const result = await updatePlan(
        clientSlug,
        month.key,
        field === "budget" ? value : null,
        field === "target" ? value : null,
      );
      if (!result.ok) showToast(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-soft px-3.5 py-[11px]">
      <span className="w-[130px] font-heading text-[13.5px] font-semibold">
        {month.label}
      </span>
      <span className="rounded-full border border-line bg-page px-2.5 py-[3px] font-heading text-[11px] font-semibold text-accent">
        Planned
      </span>
      <div className="flex-1" />
      {editable ? (
        <>
          <label className="flex items-center gap-1.5 text-xs text-muted">
            Budget $
            <input
              type="number"
              defaultValue={month.budget ?? 0}
              onBlur={(e) => commit("budget", e.target.value)}
              className="w-[90px] rounded-lg border border-line px-2 py-1.5 text-[13px]"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted">
            Target CPL $
            <input
              type="number"
              step="0.01"
              defaultValue={month.target_cpl ?? 0}
              onBlur={(e) => commit("target", e.target.value)}
              className="w-[70px] rounded-lg border border-line px-2 py-1.5 text-[13px]"
            />
          </label>
          <TwoStepDelete
            onConfirm={async () => {
              const result = await deletePlan(clientSlug, month.key);
              showToast(result.ok ? result.message : result.error);
              router.refresh();
            }}
          />
        </>
      ) : (
        <>
          <span className="text-[13px] text-ink">
            Budget <strong>{money(month.budget ?? 0)}</strong>
          </span>
          <span className="text-[13px] text-ink">
            Target CPL <strong>${month.target_cpl ?? 0}</strong>
          </span>
        </>
      )}
    </div>
  );
}

/** "Add a month" button + the prototype's Plan-next-month dialog. */
export function PlanMonthButton({
  clientSlug,
  nextKey,
  defaultBudget,
  defaultTarget,
}: {
  clientSlug: string;
  nextKey: string;
  defaultBudget: number;
  defaultTarget: number;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(defaultBudget);
  const [target, setTarget] = useState(defaultTarget);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await planMonth(clientSlug, nextKey, budget || 0, target || 0);
      showToast(result.ok ? result.message : result.error);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[9px] border border-primary bg-white px-[13px] py-[7px] font-heading text-xs font-semibold text-primary"
      >
        Add a month
      </button>
      {open && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-[rgba(22,46,39,.45)]"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-[min(360px,90vw)] flex-col gap-3.5 rounded-2xl bg-white p-[22px] shadow-[0_24px_64px_rgba(22,46,39,.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-[3px]">
              <span className="font-heading text-[16.5px] font-semibold">
                Plan {monthName(nextKey)}
              </span>
              <span className="text-[12.5px] leading-normal text-muted">
                Set the monthly budget and target CPL. Both stay editable until
                the month is archived.
              </span>
            </div>
            <label className="flex flex-col gap-[5px] text-xs font-semibold text-muted">
              Monthly budget $
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-[9px] border border-line px-[11px] py-[9px] text-sm font-normal text-ink"
              />
            </label>
            <label className="flex flex-col gap-[5px] text-xs font-semibold text-muted">
              Target CPL $
              <input
                type="number"
                step="0.01"
                value={target}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                className="w-full rounded-[9px] border border-line px-[11px] py-[9px] text-sm font-normal text-ink"
              />
            </label>
            <div className="flex justify-end gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
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
                Create month
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
