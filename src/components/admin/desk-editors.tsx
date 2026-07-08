"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/toast";
import { TwoStepDelete } from "@/components/two-step-delete";
import {
  deleteMonth,
  editDeskAction,
  editDeskNote,
  setMonthStatus,
} from "@/lib/portal/admin-actions";
import { updatePlan } from "@/lib/portal/month-actions";
import type { ReportAction, ReportNote } from "@/lib/portal/report-types";
import type { MonthStatus } from "@/lib/portal/types";

/** Draft › Approved › Published chips + the three workflow buttons. */
export function StatusWorkflow({
  clientSlug,
  monthKey,
  status,
}: {
  clientSlug: string;
  monthKey: string;
  status: MonthStatus;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();

  const set = (s: "Draft" | "Approved" | "Published") =>
    startTransition(async () => {
      const result = await setMonthStatus(clientSlug, monthKey, s);
      showToast(result.ok ? result.message : result.error);
      router.refresh();
    });

  const wf = (name: string) =>
    `rounded-full border px-2.5 py-[3px] font-heading text-xs font-semibold ${
      status === name
        ? "border-primary bg-primary text-white"
        : "border-soft bg-white text-muted"
    }`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-center gap-2">
        <span className="font-heading text-[14.5px] font-semibold">Report status</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span className={wf("Draft")}>Draft</span>
        <span>›</span>
        <span className={wf("Approved")}>Approved</span>
        <span>›</span>
        <span className={wf("Published")}>Published</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => set("Draft")}
          className="rounded-[9px] border border-line bg-white px-[13px] py-2 font-heading text-xs font-semibold text-primary disabled:opacity-60"
        >
          Save as draft
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => set("Approved")}
          className="rounded-[9px] border border-primary bg-white px-[13px] py-2 font-heading text-xs font-semibold text-primary disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => set("Published")}
          className="rounded-[9px] bg-primary px-[13px] py-2 font-heading text-xs font-semibold text-white disabled:opacity-60"
        >
          Publish to client
        </button>
      </div>
    </div>
  );
}

/** Monthly budget / target CPL inputs ("This month's setup"). */
export function MonthSetup({
  clientSlug,
  monthKey,
  budget,
  targetCpl,
}: {
  clientSlug: string;
  monthKey: string;
  budget: number;
  targetCpl: number;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [, startTransition] = useTransition();

  const commit = (field: "budget" | "target", raw: string) => {
    const v = field === "budget" ? parseInt(raw, 10) : parseFloat(raw);
    if (isNaN(v) || v < 0) return;
    startTransition(async () => {
      const result = await updatePlan(
        clientSlug,
        monthKey,
        field === "budget" ? v : null,
        field === "target" ? Math.round(v * 100) / 100 : null,
      );
      if (!result.ok) showToast(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <span className="font-heading text-[14.5px] font-semibold">
        This month&apos;s setup
      </span>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-[5px] font-heading text-[11.5px] font-semibold text-muted">
          Monthly budget
          <input
            type="number"
            key={`b${monthKey}${budget}`}
            defaultValue={budget}
            onBlur={(e) => commit("budget", e.target.value)}
            className="w-full rounded-[9px] border border-line px-[11px] py-2 font-body text-sm font-normal"
          />
        </label>
        <label className="flex flex-1 flex-col gap-[5px] font-heading text-[11.5px] font-semibold text-muted">
          Target CPL
          <input
            type="number"
            step="0.01"
            key={`t${monthKey}${targetCpl}`}
            defaultValue={targetCpl}
            onBlur={(e) => commit("target", e.target.value)}
            className="w-full rounded-[9px] border border-line px-[11px] py-2 font-body text-sm font-normal"
          />
        </label>
      </div>
      <span className="text-[11.5px] text-muted">
        Configurable per client, per month. Pacing and targets update everywhere.
      </span>
    </div>
  );
}

/** One row in the desk months list. */
export function DeskMonthDelete({
  clientSlug,
  monthKey,
}: {
  clientSlug: string;
  monthKey: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  return (
    <TwoStepDelete
      onConfirm={async () => {
        const result = await deleteMonth(clientSlug, monthKey);
        showToast(result.ok ? result.message : result.error);
        router.refresh();
      }}
    />
  );
}

/** Review action items editor: rename, keep/drop, delete, add. */
export function DeskActions({
  clientSlug,
  monthKey,
  actions,
}: {
  clientSlug: string;
  monthKey: string;
  actions: ReportAction[];
}) {
  const router = useRouter();
  const showToast = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (op: Parameters<typeof editDeskAction>[2], toast = true) =>
    startTransition(async () => {
      const result = await editDeskAction(clientSlug, monthKey, op);
      if (toast || !result.ok) showToast(result.ok ? result.message : result.error);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-center gap-2">
        <span className="font-heading text-[14.5px] font-semibold">
          Review action items
        </span>
        <div className="flex-1" />
        <button
          type="button"
          disabled={pending}
          onClick={() => run({ kind: "add" })}
          className="rounded-lg border border-primary bg-white px-[11px] py-[5px] font-heading text-[11.5px] font-semibold text-primary disabled:opacity-60"
        >
          Add item
        </button>
      </div>
      {actions.map((a) => {
        const editing = editingId === a.id;
        return (
          <div
            key={a.id}
            className={`flex items-center gap-2 rounded-[10px] border border-soft px-2.5 py-2 ${
              a.keep ? "bg-page" : "bg-white opacity-55"
            }`}
          >
            {editing ? (
              <input
                defaultValue={a.title}
                autoFocus
                onBlur={(e) => {
                  if (e.target.value !== a.title) {
                    run({ kind: "title", id: a.id, title: e.target.value }, false);
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-accent px-2 py-1.5 text-[13px]"
              />
            ) : (
              <span className="min-w-0 flex-1 text-[13px] leading-[1.4]">{a.title}</span>
            )}
            <button
              type="button"
              onClick={() => setEditingId(editing ? null : a.id)}
              className="flex-none rounded-[7px] border border-line bg-white px-2 py-1 font-heading text-[11px] font-semibold text-primary"
            >
              {editing ? "Done" : "Edit"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run({ kind: "keep", id: a.id }, false)}
              className={`flex-none rounded-[7px] border px-2.5 py-1 font-heading text-[11px] font-semibold ${
                a.keep
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-white text-muted"
              }`}
            >
              {a.keep ? "Keep ✓" : "Dropped"}
            </button>
            <TwoStepDelete
              onConfirm={async () => {
                const result = await editDeskAction(clientSlug, monthKey, {
                  kind: "delete",
                  id: a.id,
                });
                showToast(result.ok ? result.message : result.error);
                router.refresh();
              }}
            />
          </div>
        );
      })}
      <span className="text-[11.5px] text-muted">
        Dropped items never reach the client.
      </span>
    </div>
  );
}

/** Notes editor: edit text, toggle visibility, delete, add. */
export function DeskNotes({
  clientSlug,
  monthKey,
  notes,
}: {
  clientSlug: string;
  monthKey: string;
  notes: ReportNote[];
}) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();

  const run = (op: Parameters<typeof editDeskNote>[2], toast = true) =>
    startTransition(async () => {
      const result = await editDeskNote(clientSlug, monthKey, op);
      if (toast || !result.ok) showToast(result.ok ? result.message : result.error);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-[18px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex items-center gap-2">
        <span className="font-heading text-[14.5px] font-semibold">Notes</span>
        <div className="flex-1" />
        <button
          type="button"
          disabled={pending}
          onClick={() => run({ kind: "add" })}
          className="rounded-lg border border-primary bg-white px-[11px] py-[5px] font-heading text-[11.5px] font-semibold text-primary disabled:opacity-60"
        >
          Add note
        </button>
      </div>
      {notes.map((n) => (
        <div
          key={n.id ?? n.text}
          className="flex flex-col gap-1.5 rounded-[10px] border border-soft p-2.5"
        >
          <textarea
            defaultValue={n.text}
            rows={2}
            onBlur={(e) => {
              if (e.target.value !== n.text && n.id) {
                run({ kind: "text", id: n.id, text: e.target.value }, false);
              }
            }}
            className="resize-y border-none bg-transparent p-0 text-[13px] leading-[1.45] outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending || !n.id}
              onClick={() => n.id && run({ kind: "visible", id: n.id }, false)}
              className={`self-start rounded-full border px-2.5 py-[3px] font-heading text-[10.5px] font-semibold ${
                n.visible
                  ? "border-line bg-soft text-primary"
                  : "border-ink bg-ink text-line"
              }`}
            >
              {n.visible ? "Visible to client" : "Internal only"}
            </button>
            <TwoStepDelete
              onConfirm={async () => {
                if (!n.id) return;
                const result = await editDeskNote(clientSlug, monthKey, {
                  kind: "delete",
                  id: n.id,
                });
                showToast(result.ok ? result.message : result.error);
                router.refresh();
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
