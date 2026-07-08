"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { monthName, toMonthKey } from "@/lib/format";
import { fixturesEnabled } from "./fixtures-flag";
import type { MonthReport, ReportAction, ReportNote } from "./report-types";

/**
 * Admin workspace mutations (publish workflow, client CRUD, review-desk
 * editors). Internal-only: enforced by the RLS write policies for Supabase
 * and mirrored in the fixture store.
 */

type ActionResult = { ok: true; message: string } | { ok: false; error: string };
const DENIED: ActionResult = { ok: false, error: "Internal access only." };

type Gate =
  | { mode: "fixture" }
  | { mode: "supabase"; supabase: Awaited<ReturnType<typeof createClient>> }
  | { mode: "denied" };

async function requireInternal(): Promise<Gate> {
  if (fixturesEnabled()) return { mode: "fixture" };
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_internal");
  return data ? { mode: "supabase", supabase } : { mode: "denied" };
}

async function clientBySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
) {
  const { data } = await supabase
    .from("clients")
    .select("id, name, manager")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

function revalidate(slug: string) {
  revalidatePath(`/${slug}`, "layout");
  revalidatePath("/admin", "layout");
}

/* ------------------------------------------------------------------ */
/* Publish workflow                                                    */
/* ------------------------------------------------------------------ */

export async function setMonthStatus(
  clientSlug: string,
  monthKey: string,
  status: "Draft" | "Approved" | "Published",
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  let clientName = clientSlug;
  if (gate.mode === "fixture") {
    const { fixtureSetMonthStatus, fixtureSession } = await import("./fixture-provider");
    if (!fixtureSetMonthStatus(clientSlug, monthKey, status)) {
      return { ok: false, error: "Month not found." };
    }
    clientName =
      fixtureSession().clients.find((c) => c.slug === clientSlug)?.name ?? clientSlug;
  } else {
    const client = await clientBySlug(gate.supabase, clientSlug);
    if (!client) return { ok: false, error: "Unknown client." };
    clientName = client.name;
    const { error } = await gate.supabase
      .from("months")
      .update({ status })
      .eq("client_id", client.id)
      .eq("month", `${monthKey}-01`);
    if (error) return { ok: false, error: error.message };
  }
  revalidate(clientSlug);
  return {
    ok: true,
    message:
      status === "Published"
        ? `Published. ${clientName} can now see ${monthName(monthKey)}.`
        : `Report marked as ${status.toLowerCase()}.`,
  };
}

/** Desk months list: Draft/Planned months are deletable unless it's the only reported month. */
export async function deleteMonth(
  clientSlug: string,
  monthKey: string,
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;
  const label = monthName(monthKey);

  if (gate.mode === "fixture") {
    const { fixtureDeleteMonth } = await import("./fixture-provider");
    if (!fixtureDeleteMonth(clientSlug, monthKey)) {
      return { ok: false, error: "This month can't be deleted." };
    }
  } else {
    const client = await clientBySlug(gate.supabase, clientSlug);
    if (!client) return { ok: false, error: "Unknown client." };
    const { data: rows, error: readErr } = await gate.supabase
      .from("months")
      .select("month, status, report")
      .eq("client_id", client.id);
    if (readErr) return { ok: false, error: readErr.message };
    const target = (rows ?? []).find((r) => toMonthKey(r.month) === monthKey);
    if (!target) return { ok: false, error: "Month not found." };
    const reportedCount = (rows ?? []).filter((r) => r.report != null).length;
    const deletable =
      (target.status === "Draft" || target.status === "Planned") &&
      !(target.report != null && reportedCount === 1);
    if (!deletable) return { ok: false, error: "This month can't be deleted." };
    const { error } = await gate.supabase
      .from("months")
      .delete()
      .eq("client_id", client.id)
      .eq("month", `${monthKey}-01`);
    if (error) return { ok: false, error: error.message };
  }
  revalidate(clientSlug);
  return { ok: true, message: `${label} deleted.` };
}

/* ------------------------------------------------------------------ */
/* Client CRUD                                                         */
/* ------------------------------------------------------------------ */

function initialsFor(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2) || "C"
  ).toUpperCase();
}

export async function updateClientDetails(
  clientSlug: string,
  patch: {
    name?: string;
    industry?: string;
    objective?: string;
    manager?: string;
    contact?: string;
    contact_role?: string;
    accent_colour?: string;
  },
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;
  const withInitials = {
    ...patch,
    ...(patch.name ? { initials: initialsFor(patch.name) } : {}),
  };

  if (gate.mode === "fixture") {
    const { fixtureUpdateClient } = await import("./fixture-provider");
    const { accent_colour, ...rest } = withInitials;
    if (
      !fixtureUpdateClient(clientSlug, {
        ...rest,
        ...(accent_colour ? { colour: accent_colour } : {}),
      })
    ) {
      return { ok: false, error: "Unknown client." };
    }
  } else {
    const { error } = await gate.supabase
      .from("clients")
      .update(withInitials)
      .eq("slug", clientSlug);
    if (error) return { ok: false, error: error.message };
  }
  revalidate(clientSlug);
  return {
    ok: true,
    message: patch.accent_colour
      ? "Accent colour updated."
      : `Settings saved${patch.name ? ` for ${patch.name}` : ""}.`,
  };
}

/** New client shell: current month as Draft + empty report scaffold. */
export async function addClient(): Promise<
  { ok: true; slug: string } | { ok: false; error: string }
> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return { ok: false, error: "Internal access only." };

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const slug = `new-client-${now.getTime().toString(36)}`;

  if (gate.mode === "fixture") {
    const { fixtureAddClient } = await import("./fixture-provider");
    if (!fixtureAddClient(slug, monthKey)) {
      return { ok: false, error: "Could not create client." };
    }
  } else {
    const { data: client, error } = await gate.supabase
      .from("clients")
      .insert({
        slug,
        name: "New client",
        initials: "NC",
        industry: "Industry",
        objective: "Lead generation",
        manager: "Unassigned",
        accent_colour: "#1E4D40",
        currency: "AUD",
      })
      .select("id")
      .single();
    if (error || !client) return { ok: false, error: error?.message ?? "Insert failed." };
    const shellReport: MonthReport = {
      summary: {
        health: "Draft",
        text: "No analysis yet. Set the monthly budget and target CPL, connect the ad account, then run the first analysis.",
        recommendation: "Run the first analysis once the ad account is connected.",
        pills: [],
      },
      metrics: { spend: 0, leads: 0, cpl: 0, ctr: 0, cpc: 0, conv: 0, forecast: 0 },
      prev: null,
      cpl_trend: [],
      campaigns: [],
      creatives: [],
      audiences: [],
      actions: [],
      changed: [],
      attention: [],
      working: [],
      notes: [],
    };
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const { error: monthErr } = await gate.supabase.from("months").insert({
      client_id: client.id,
      month: `${monthKey}-01`,
      status: "Draft",
      budget: 0,
      target_cpl: 0,
      days_elapsed: now.getDate(),
      days_in_month: daysInMonth,
      report: shellReport,
    });
    if (monthErr) return { ok: false, error: monthErr.message };
  }
  revalidate(slug);
  return { ok: true, slug };
}

export async function deleteClient(clientSlug: string): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  let name = clientSlug;
  if (gate.mode === "fixture") {
    const { fixtureDeleteClient, fixtureSession } = await import("./fixture-provider");
    name =
      fixtureSession().clients.find((c) => c.slug === clientSlug)?.name ?? clientSlug;
    if (!fixtureDeleteClient(clientSlug)) {
      return { ok: false, error: "The last client can't be removed." };
    }
  } else {
    const { count } = await gate.supabase
      .from("clients")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "The last client can't be removed." };
    }
    const client = await clientBySlug(gate.supabase, clientSlug);
    if (!client) return { ok: false, error: "Unknown client." };
    name = client.name;
    const { error } = await gate.supabase.from("clients").delete().eq("id", client.id);
    if (error) return { ok: false, error: error.message };
  }
  revalidate(clientSlug);
  return { ok: true, message: `${name} removed.` };
}

/* ------------------------------------------------------------------ */
/* Review desk: action + note editors (report jsonb)                   */
/* ------------------------------------------------------------------ */

async function mutateReport(
  gate: Exclude<Gate, { mode: "denied" }>,
  clientSlug: string,
  monthKey: string,
  fn: (report: MonthReport) => string | null, // returns error or null
): Promise<ActionResult> {
  if (gate.mode === "fixture") {
    // fixture edits go through the dedicated helpers; this path is unused
    return { ok: false, error: "Not supported in fixture mode." };
  }
  const client = await clientBySlug(gate.supabase, clientSlug);
  if (!client) return { ok: false, error: "Unknown client." };
  const { data: row, error: readErr } = await gate.supabase
    .from("months")
    .select("id, report")
    .eq("client_id", client.id)
    .eq("month", `${monthKey}-01`)
    .maybeSingle();
  if (readErr || !row) return { ok: false, error: readErr?.message ?? "Month not found." };
  const report = (row.report ?? {}) as MonthReport;
  const err = fn(report);
  if (err) return { ok: false, error: err };
  const { error } = await gate.supabase
    .from("months")
    .update({ report })
    .eq("id", row.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Saved." };
}

export async function editDeskAction(
  clientSlug: string,
  monthKey: string,
  op:
    | { kind: "title"; id: string; title: string }
    | { kind: "keep"; id: string }
    | { kind: "delete"; id: string }
    | { kind: "add" },
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  const newAction = (managerFirst: string): ReportAction => ({
    id: `a_${Date.now().toString(36)}`,
    title: "New action item",
    why: "Add a short note on why this matters.",
    owner: `EFG · ${managerFirst}`,
    priority: "Medium",
    due: "This week",
    status: "week",
    impact: "To be confirmed.",
    keep: true,
  });

  let result: ActionResult;
  if (gate.mode === "fixture") {
    const { fixtureEditActions, fixtureSession } = await import("./fixture-provider");
    const manager =
      fixtureSession().clients.find((c) => c.slug === clientSlug)?.manager ?? "Team";
    const fixtureOp =
      op.kind === "add"
        ? { kind: "add" as const, action: newAction(manager.split(" ")[0]) }
        : op;
    result = fixtureEditActions(clientSlug, monthKey, fixtureOp)
      ? { ok: true, message: opMessage(op) }
      : { ok: false, error: "Action not found." };
  } else {
    const client = await clientBySlug(gate.supabase, clientSlug);
    result = await mutateReport(gate, clientSlug, monthKey, (report) => {
      report.actions = report.actions ?? [];
      if (op.kind === "add") {
        report.actions.unshift(
          newAction((client?.manager ?? "Team").split(" ")[0] || "Team"),
        );
        return null;
      }
      const a = report.actions.find((x) => x.id === op.id);
      if (op.kind === "delete") {
        report.actions = report.actions.filter((x) => x.id !== op.id);
        return null;
      }
      if (!a) return "Action not found.";
      if (op.kind === "title") a.title = op.title;
      if (op.kind === "keep") a.keep = !a.keep;
      return null;
    });
    if (result.ok) result = { ok: true, message: opMessage(op) };
  }
  if (result.ok) revalidate(clientSlug);
  return result;

  function opMessage(o: typeof op): string {
    if (o.kind === "add") return "Action item added. Edit the wording, then keep or drop it.";
    if (o.kind === "delete") return "Action item deleted.";
    if (o.kind === "keep") return "Updated.";
    return "Saved.";
  }
}

export async function editDeskNote(
  clientSlug: string,
  monthKey: string,
  op:
    | { kind: "text"; id: string; text: string }
    | { kind: "visible"; id: string }
    | { kind: "delete"; id: string }
    | { kind: "add" },
): Promise<ActionResult> {
  const gate = await requireInternal();
  if (gate.mode === "denied") return DENIED;

  const newNote = (): ReportNote => ({
    id: `n_${Date.now().toString(36)}`,
    text: "New note. Write it, then choose who can see it.",
    visible: false,
  });

  let result: ActionResult;
  if (gate.mode === "fixture") {
    const { fixtureEditNotes } = await import("./fixture-provider");
    const fixtureOp =
      op.kind === "add" ? { kind: "add" as const, note: newNote() } : op;
    result = fixtureEditNotes(clientSlug, monthKey, fixtureOp)
      ? { ok: true, message: opMessage(op) }
      : { ok: false, error: "Note not found." };
  } else {
    result = await mutateReport(gate, clientSlug, monthKey, (report) => {
      report.notes = report.notes ?? [];
      if (op.kind === "add") {
        report.notes.push(newNote());
        return null;
      }
      const n = report.notes.find((x) => x.id === op.id);
      if (op.kind === "delete") {
        report.notes = report.notes.filter((x) => x.id !== op.id);
        return null;
      }
      if (!n) return "Note not found.";
      if (op.kind === "text") n.text = op.text;
      if (op.kind === "visible") n.visible = !n.visible;
      return null;
    });
    if (result.ok) result = { ok: true, message: opMessage(op) };
  }
  if (result.ok) revalidate(clientSlug);
  return result;

  function opMessage(o: typeof op): string {
    if (o.kind === "add") return "Note added as internal only.";
    if (o.kind === "delete") return "Note deleted.";
    return "Saved.";
  }
}
