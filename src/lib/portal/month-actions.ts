"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { monthName } from "@/lib/format";
import { fixturesEnabled } from "./fixtures-flag";
import type { ReportAction, ReportCreative } from "./report-types";

/**
 * Internal-only month/report mutations (budget planning, action board,
 * creative-refresh shortcuts). Supabase writes run as the signed-in user —
 * the RLS write policies (internal only) are the enforcement layer; the
 * fixture store mirrors them for dev.
 */

type ActionResult = { ok: true; message: string } | { ok: false; error: string };

async function requireInternal(): Promise<
  | { mode: "fixture" }
  | { mode: "supabase"; supabase: Awaited<ReturnType<typeof createClient>> }
  | { mode: "denied" }
> {
  if (fixturesEnabled()) return { mode: "fixture" };
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_internal");
  return data ? { mode: "supabase", supabase } : { mode: "denied" };
}

async function clientIdBySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}

const DENIED: ActionResult = { ok: false, error: "Internal access only." };

export async function planMonth(
  clientSlug: string,
  monthKey: string,
  budget: number,
  targetCpl: number,
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;
  const label = monthName(monthKey);

  if (gate.mode === "fixture") {
    const { fixturePlanMonth } = await import("./fixture-provider");
    if (!fixturePlanMonth(clientSlug, monthKey, budget, targetCpl)) {
      return { ok: false, error: `${label} already exists.` };
    }
  } else {
    const clientId = await clientIdBySlug(gate.supabase, clientSlug);
    if (!clientId) return { ok: false, error: "Unknown client." };
    const { error } = await gate.supabase.from("months").insert({
      client_id: clientId,
      month: `${monthKey}-01`,
      status: "Planned",
      budget,
      target_cpl: targetCpl,
    });
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/${clientSlug}`, "layout");
  return { ok: true, message: `${label} planned at $${Math.round(budget).toLocaleString("en-AU")}.` };
}

export async function updatePlan(
  clientSlug: string,
  monthKey: string,
  budget: number | null,
  targetCpl: number | null,
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  if (gate.mode === "fixture") {
    const { fixtureUpdatePlan } = await import("./fixture-provider");
    if (!fixtureUpdatePlan(clientSlug, monthKey, budget, targetCpl)) {
      return { ok: false, error: "Month not found." };
    }
  } else {
    const clientId = await clientIdBySlug(gate.supabase, clientSlug);
    if (!clientId) return { ok: false, error: "Unknown client." };
    const patch: Record<string, number> = {};
    if (budget != null) patch.budget = budget;
    if (targetCpl != null) patch.target_cpl = targetCpl;
    const { data: updated, error } = await gate.supabase
      .from("months")
      .update(patch)
      .eq("client_id", clientId)
      .eq("month", `${monthKey}-01`)
      .select("id");
    if (error) return { ok: false, error: error.message };
    if (!updated?.length) return { ok: false, error: "Month not found." };
  }
  revalidatePath(`/${clientSlug}`, "layout");
  return { ok: true, message: "Plan updated." };
}

export async function deletePlan(
  clientSlug: string,
  monthKey: string,
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;
  const label = monthName(monthKey);

  if (gate.mode === "fixture") {
    const { fixtureDeletePlan } = await import("./fixture-provider");
    if (!fixtureDeletePlan(clientSlug, monthKey)) {
      return { ok: false, error: "Only planned months can be deleted." };
    }
  } else {
    const clientId = await clientIdBySlug(gate.supabase, clientSlug);
    if (!clientId) return { ok: false, error: "Unknown client." };
    // guard: only Planned month shells (no report) are deletable
    const { data: deleted, error } = await gate.supabase
      .from("months")
      .delete()
      .eq("client_id", clientId)
      .eq("month", `${monthKey}-01`)
      .eq("status", "Planned")
      .is("report", null)
      .select("id");
    if (error) return { ok: false, error: error.message };
    if (!deleted?.length) {
      return { ok: false, error: "Only planned months can be deleted." };
    }
  }
  revalidatePath(`/${clientSlug}`, "layout");
  return { ok: true, message: `${label} plan removed.` };
}

/** Prototype toast copy for the action board toggle. */
export async function toggleActionDone(
  clientSlug: string,
  monthKey: string,
  actionId: string,
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  let done: boolean;
  if (gate.mode === "fixture") {
    const { fixtureToggleAction } = await import("./fixture-provider");
    const result = fixtureToggleAction(clientSlug, monthKey, actionId);
    if (!result) return { ok: false, error: "Action not found." };
    done = result.done;
  } else {
    const clientId = await clientIdBySlug(gate.supabase, clientSlug);
    if (!clientId) return { ok: false, error: "Unknown client." };
    const { data: row, error: readErr } = await gate.supabase
      .from("months")
      .select("id, report")
      .eq("client_id", clientId)
      .eq("month", `${monthKey}-01`)
      .maybeSingle();
    if (readErr || !row) return { ok: false, error: readErr?.message ?? "Month not found." };
    const report = (row.report ?? {}) as { actions?: ReportAction[] };
    const action = (report.actions ?? []).find((a) => a.id === actionId);
    if (!action) return { ok: false, error: "Action not found." };
    done = action.status !== "done";
    action.status = done ? "done" : "week";
    if (done) action.due = "Done today";
    const { error } = await gate.supabase
      .from("months")
      .update({ report })
      .eq("id", row.id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/${clientSlug}/${monthKey}`, "layout");
  return {
    ok: true,
    message: done ? "Nice. Marked as completed." : "Reopened and moved to this week.",
  };
}

/** Creative screen: add a refresh task for a fatiguing creative. */
export async function addCreativeRefresh(
  clientSlug: string,
  monthKey: string,
  creativeId: string,
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  if (gate.mode === "fixture") {
    const { fixtureAddRefresh, fixtureReport, fixtureSession } = await import(
      "./fixture-provider"
    );
    const report = fixtureReport(clientSlug, monthKey) as {
      creatives?: ReportCreative[];
    } | null;
    const creative = report?.creatives?.find((cr) => cr.id === creativeId);
    if (!creative) return { ok: false, error: "Creative not found." };
    const manager =
      fixtureSession().clients.find((c) => c.slug === clientSlug)?.manager ?? "Team";
    const result = fixtureAddRefresh(
      clientSlug,
      monthKey,
      creativeId,
      refreshAction(creative, manager, creativeId),
    );
    if (result === "exists") return { ok: true, message: "Already on the plan." };
    if (!result) return { ok: false, error: "Month not found." };
  } else {
    const clientId = await clientIdBySlug(gate.supabase, clientSlug);
    if (!clientId) return { ok: false, error: "Unknown client." };
    const [{ data: row, error: readErr }, { data: clientRow }] = await Promise.all([
      gate.supabase
        .from("months")
        .select("id, report")
        .eq("client_id", clientId)
        .eq("month", `${monthKey}-01`)
        .maybeSingle(),
      gate.supabase.from("clients").select("manager").eq("id", clientId).maybeSingle(),
    ]);
    if (readErr || !row) return { ok: false, error: readErr?.message ?? "Month not found." };
    const report = (row.report ?? {}) as {
      actions?: Array<ReportAction & { _auto?: string }>;
      creatives?: ReportCreative[];
    };
    const creative = (report.creatives ?? []).find((cr) => cr.id === creativeId);
    if (!creative) return { ok: false, error: "Creative not found." };
    report.actions = report.actions ?? [];
    if (report.actions.some((a) => a._auto === creativeId)) {
      return { ok: true, message: "Already on the plan." };
    }
    report.actions.push(
      refreshAction(creative, clientRow?.manager ?? "Team", creativeId) as ReportAction,
    );
    const { error } = await gate.supabase
      .from("months")
      .update({ report })
      .eq("id", row.id);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/${clientSlug}/${monthKey}`, "layout");
  return { ok: true, message: "Added to the action plan." };
}

/** Prototype's auto-generated refresh action item. */
function refreshAction(
  creative: ReportCreative,
  manager: string,
  creativeId: string,
): Record<string, unknown> {
  return {
    id: `auto_${creativeId}`,
    _auto: creativeId,
    title: `Refresh the ${creative.name.toLowerCase()}`,
    why: creative.note,
    owner: `EFG · ${manager.split(" ")[0]}`,
    priority: "Medium",
    due: "This week",
    status: "week",
    impact: "Fresh creative before performance dips.",
    keep: true,
  };
}
