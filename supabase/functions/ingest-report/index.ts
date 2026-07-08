/**
 * Ingest a daily JSON report export (Meta Dashboard / Daily Tracker /
 * A/B Testing Log) for one client:
 *   1. verify the caller is signed in AND internal (memberships RLS helper)
 *   2. parse + validate via the shared pure core (same code as the app/tests)
 *   3. store the raw file in the private report-uploads bucket
 *   4. atomically version the upload (prev Current → Archived) and upsert
 *      the month row via the ingest_apply RPC (service role)
 *
 * Deploy: npx supabase functions deploy ingest-report
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  applyUpload,
  detectAndParse,
  isParseError,
} from "../../../src/lib/ingest/core.ts";
import { monthName } from "../../../src/lib/format.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "POST only" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // --- caller must be a signed-in internal user -------------------------
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(401, { error: "Sign in required." });
  const asCaller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await asCaller.auth.getUser();
  if (!user) return json(401, { error: "Sign in required." });
  const { data: internal, error: roleErr } = await asCaller.rpc("is_internal");
  if (roleErr) return json(500, { error: `Role check failed: ${roleErr.message}` });
  if (!internal) return json(403, { error: "Internal (EFG staff) access only." });

  // --- input ------------------------------------------------------------
  let body: { client_id?: string; file_name?: string; raw_text?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid request body." });
  }
  const { client_id, file_name, raw_text } = body;
  if (!client_id || !file_name || typeof raw_text !== "string") {
    return json(400, { error: "client_id, file_name and raw_text are required." });
  }

  const parsed = detectAndParse(raw_text);
  if (isParseError(parsed)) return json(400, { error: parsed.error });

  // --- apply ------------------------------------------------------------
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: client, error: clientErr } = await service
    .from("clients")
    .select("id, slug, name")
    .eq("id", client_id)
    .maybeSingle();
  if (clientErr) return json(500, { error: clientErr.message });
  if (!client) return json(404, { error: "Unknown client." });

  const monthDate = `${parsed.monthKey}-01`;
  const { data: existing, error: monthErr } = await service
    .from("months")
    .select("status, budget, target_cpl, days_elapsed, days_in_month, report")
    .eq("client_id", client.id)
    .eq("month", monthDate)
    .maybeSingle();
  if (monthErr) return json(500, { error: monthErr.message });

  const state = applyUpload(
    parsed,
    existing
      ? {
          status: existing.status,
          budget: Number(existing.budget ?? 0),
          target_cpl: Number(existing.target_cpl ?? 0),
          days_elapsed: existing.days_elapsed ?? 0,
          days_in_month: existing.days_in_month ?? 0,
          report: existing.report ?? {},
        }
      : null,
  );

  // predict the next version for the storage path (ingest_apply recomputes
  // authoritatively under the per-client lock)
  const { data: prev } = await service
    .from("report_uploads")
    .select("version")
    .eq("client_id", client.id)
    .eq("type", parsed.type)
    .eq("status", "Current")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (prev?.version ?? 0) + 1;

  const safeName = file_name.replace(/[/\\]/g, "_");
  const filePath = `${client.slug}/${parsed.type}/v${nextVersion}-${safeName}`;
  const { error: uploadErr } = await service.storage
    .from("report-uploads")
    .upload(filePath, new Blob([raw_text], { type: "application/json" }), {
      upsert: true,
      contentType: "application/json",
    });
  if (uploadErr) return json(500, { error: `Storage upload failed: ${uploadErr.message}` });

  const { data: applied, error: applyErr } = await service.rpc("ingest_apply", {
    p_client_id: client.id,
    p_type: parsed.type,
    p_as_of: parsed.asOfIso,
    p_file_path: filePath,
    p_summary: parsed.summary,
    p_month: monthDate,
    p_month_status: existing?.status ?? state.status,
    p_budget: state.budget,
    p_target_cpl: state.target_cpl,
    p_days_elapsed: state.days_elapsed,
    p_days_in_month: state.days_in_month,
    p_report: state.report,
    p_uploaded_by: user.id,
  });
  if (applyErr) return json(500, { error: `Apply failed: ${applyErr.message}` });

  const archived = applied?.archived_version ?? null;
  const label = monthName(parsed.monthKey);
  return json(200, {
    ok: true,
    kind: parsed.kind,
    monthKey: parsed.monthKey,
    version: applied?.version ?? nextVersion,
    message: `${parsed.kind} saved as Current for ${label}${archived ? `. v${archived} archived.` : "."}`,
  });
});
