"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/toast";
import { updateClientDetails } from "@/lib/portal/admin-actions";
import { updatePlan } from "@/lib/portal/month-actions";
import { TwoStepDelete } from "@/components/two-step-delete";
import { deletePlan } from "@/lib/portal/month-actions";
import type { PortalClient, PortalMonth } from "@/lib/portal/types";

const SWATCHES = ["#2E3192", "#B45309", "#0E7490", "#6D28D9", "#1E4D40"];

const FIELD =
  "w-full rounded-[10px] border border-line px-3 py-[9px] font-body text-sm font-normal text-ink";
const LABEL =
  "flex flex-col gap-[5px] font-heading text-xs font-semibold text-muted";

/** Client details form + accent swatches + save. */
export function ClientDetailsForm({ client }: { client: PortalClient }) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: client.name,
    industry: client.industry ?? "",
    objective: client.objective ?? "",
    manager: client.manager ?? "",
    contact: client.contact ?? "",
    contact_role: client.contact_role ?? "",
  });

  const save = () =>
    startTransition(async () => {
      const result = await updateClientDetails(client.slug, form);
      showToast(result.ok ? result.message : result.error);
      router.refresh();
    });

  const pickColour = (colour: string) =>
    startTransition(async () => {
      const result = await updateClientDetails(client.slug, {
        accent_colour: colour,
      });
      showToast(result.ok ? result.message : result.error);
      router.refresh();
    });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex flex-col gap-[18px] rounded-2xl border border-line bg-white p-[22px] shadow-[0_1px_2px_rgba(22,46,39,.05)]">
      <div className="flex flex-col gap-0.5">
        <span className="font-heading text-[15.5px] font-semibold">Client details</span>
        <span className="text-[12.5px] text-muted">
          These shape {client.name}&apos;s dashboard and every new monthly report.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[560px]:grid-cols-1">
        <label className={LABEL}>
          Client name
          <input value={form.name} onChange={set("name")} className={FIELD} />
        </label>
        <label className={LABEL}>
          Industry
          <input value={form.industry} onChange={set("industry")} className={FIELD} />
        </label>
        <label className={LABEL}>
          Campaign objective
          <input value={form.objective} onChange={set("objective")} className={FIELD} />
        </label>
        <label className={LABEL}>
          EFG account manager
          <input value={form.manager} onChange={set("manager")} className={FIELD} />
        </label>
        <label className={LABEL}>
          Client contact
          <input value={form.contact} onChange={set("contact")} className={FIELD} />
        </label>
        <label className={LABEL}>
          Contact role
          <input
            value={form.contact_role}
            onChange={set("contact_role")}
            className={FIELD}
          />
        </label>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-heading text-xs font-semibold text-muted">
          Client accent colour
        </span>
        <div className="flex gap-2.5">
          {SWATCHES.map((col) => (
            <button
              key={col}
              type="button"
              title={col}
              onClick={() => pickColour(col)}
              className="h-[34px] w-[34px] rounded-[10px]"
              style={{
                background: col,
                border:
                  client.accent_colour === col
                    ? "3px solid #162E27"
                    : "3px solid #E6F3F0",
              }}
            />
          ))}
        </div>
        <span className="text-xs text-muted">
          Used only on the client&apos;s avatar and highlights. EFG green leads
          the design. When a logo is on file it replaces the avatar.
        </span>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="self-start rounded-[10px] bg-primary px-4 py-[9px] font-heading text-[13px] font-semibold text-white disabled:opacity-60"
      >
        Save settings
      </button>
    </div>
  );
}

/**
 * Budget & target history row. Lifecycle (derived, per handoff):
 * Planned = no report (editable, deletable); Published = latest reported
 * (editable, openable); Archived = older reported (read-only, openable).
 */
export function HistoryRow({
  clientSlug,
  month,
  lifecycle,
  resultText,
}: {
  clientSlug: string;
  month: PortalMonth;
  lifecycle: "Planned" | "Published" | "Archived";
  resultText: string;
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
        month.key,
        field === "budget" ? v : null,
        field === "target" ? Math.round(v * 100) / 100 : null,
      );
      if (!result.ok) showToast(result.error);
      router.refresh();
    });
  };

  const chip =
    lifecycle === "Published"
      ? "border-primary bg-primary text-white"
      : lifecycle === "Planned"
        ? "border-line bg-page text-accent"
        : "border-line bg-page text-muted";

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-t border-soft px-0.5 py-[9px]">
      <span className="w-[110px] flex-none font-heading text-[13px] font-semibold">
        {month.label}
      </span>
      {lifecycle === "Archived" ? (
        <>
          <span className="w-[100px] flex-none py-[7px] text-[13px] text-muted">
            ${Math.round(month.budget ?? 0).toLocaleString("en-AU")}
          </span>
          <span className="w-[80px] flex-none py-[7px] text-[13px] text-muted">
            ${month.target_cpl ?? 0}
          </span>
        </>
      ) : (
        <>
          <input
            type="number"
            defaultValue={month.budget ?? 0}
            onBlur={(e) => commit("budget", e.target.value)}
            className="w-[100px] flex-none rounded-lg border border-line px-2 py-1.5 text-[13px]"
          />
          <input
            type="number"
            step="0.01"
            defaultValue={month.target_cpl ?? 0}
            onBlur={(e) => commit("target", e.target.value)}
            className="w-[80px] flex-none rounded-lg border border-line px-2 py-1.5 text-[13px]"
          />
        </>
      )}
      <span className="min-w-[150px] flex-1 text-[12.5px] text-muted">{resultText}</span>
      <span
        className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-[3px] font-heading text-[11px] font-semibold ${chip}`}
      >
        {lifecycle}
      </span>
      {lifecycle !== "Planned" && (
        <button
          type="button"
          onClick={() => router.push(`/${clientSlug}/${month.key}/overview`)}
          className="rounded-lg border border-line bg-white px-[11px] py-[5px] font-heading text-[11px] font-semibold text-primary"
        >
          Open
        </button>
      )}
      {lifecycle === "Planned" && (
        <TwoStepDelete
          onConfirm={async () => {
            const result = await deletePlan(clientSlug, month.key);
            showToast(result.ok ? result.message : result.error);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
