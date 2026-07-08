import { monthName, parseAuDate, parseAuTimestamp } from "@/lib/format";
import {
  applyUpload,
  detectAndParse,
  isParseError,
  type UploadSummary,
  type UploadType,
  KIND_TO_TYPE,
} from "@/lib/ingest/core";
import { REPORT_KEYS } from "./report-types";
import type { MonthStatus, PortalClient, PortalMonth, UploadRowDb } from "./types";
import type { ProviderSession } from "./supabase-provider";

/**
 * Dev-only data provider backed by the design-handoff dataset, so the shell
 * and screens can be rendered (and screenshot-compared against the
 * prototype) without a reachable Supabase project. The dataset is cloned
 * into a mutable in-memory store at module load so the ingestion flow works
 * end-to-end too (state resets when the dev server restarts).
 *
 * Enabled only when EFG_DEV_FIXTURES=1 in development — see fixtures-flag.ts.
 * Never enable in production: it bypasses authentication.
 */

import { DB } from "../../../handoff/report-data.js";

type HandoffUpload = {
  id: string;
  type: string;
  as_of: string;
  uploaded: string;
  file: string;
  status: "Current" | "Archived";
  version: number;
  summary: UploadSummary;
  prev_summary?: UploadSummary;
};

type HandoffClient = {
  id: string;
  name: string;
  initials: string;
  colour: string;
  logo?: string;
  contact?: string;
  contact_role?: string;
  industry: string;
  objective: string;
  manager: string;
  currency: string;
  report_uploads?: HandoffUpload[];
  months: Record<string, HandoffMonth>;
};

type HandoffMonth = {
  label: string;
  status: MonthStatus;
  updated?: string;
  days_elapsed?: number;
  days_in_month?: number;
  budget?: number;
  target_cpl?: number;
  metrics?: unknown;
} & Record<string, unknown>;

/** Mutable store — the fixture "database". */
const store = structuredClone(
  DB as unknown as { clients: HandoffClient[] },
);
const clients = store.clients;

/** Handoff 'updated' strings via the shared DST-aware Sydney parser. */
function parseUpdated(text: string | undefined): string | null {
  return text ? parseAuTimestamp(text) : null;
}

export function fixtureSession(): ProviderSession {
  return {
    userEmail: "dev-fixtures@efgconsulting.id",
    realRole: "internal",
    clients: [...clients]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (c): PortalClient => ({
          id: c.id,
          slug: c.id,
          name: c.name,
          initials: c.initials,
          industry: c.industry,
          objective: c.objective,
          manager: c.manager,
          contact: c.contact ?? null,
          contact_role: c.contact_role ?? null,
          accent_colour: c.colour,
          // handoff logo assets are mirrored into public/fixtures/ by filename
          logo_url: c.logo ? `/fixtures/${c.logo.split("/").pop()}` : null,
          currency: c.currency,
        }),
      ),
  };
}

/** The report payload for one fixture month, shaped like months.report jsonb. */
export function fixtureReport(clientSlug: string, monthKey: string): unknown {
  const c = clients.find((x) => x.id === clientSlug);
  const m = c?.months[monthKey] as Record<string, unknown> | undefined;
  if (!m || m.metrics == null) return null;
  const report: Record<string, unknown> = {};
  for (const key of REPORT_KEYS) {
    if (key in m) report[key] = m[key];
  }
  return report;
}

export function fixtureMonths(clientSlug: string): PortalMonth[] {
  const c = clients.find((x) => x.id === clientSlug);
  if (!c) return [];
  return Object.keys(c.months)
    .sort()
    .reverse()
    .map((key) => {
      const m = c.months[key];
      return {
        id: `${clientSlug}:${key}`,
        key,
        label: m.label ?? monthName(key),
        status: m.status,
        budget: m.budget ?? null,
        target_cpl: m.target_cpl ?? null,
        days_in_month: m.days_in_month ?? null,
        days_elapsed: m.days_elapsed ?? null,
        updated_at: parseUpdated(m.updated),
        has_report: m.metrics != null,
      };
    });
}

/** report_uploads rows for a client, shaped like the DB rows, newest first. */
export function fixtureUploads(clientSlug: string): UploadRowDb[] {
  const c = clients.find((x) => x.id === clientSlug);
  return (c?.report_uploads ?? []).map((u) => ({
    id: u.id,
    type: (KIND_TO_TYPE[u.type as keyof typeof KIND_TO_TYPE] ??
      "meta_dashboard") as UploadType,
    as_of: parseAuDate(u.as_of) ?? u.as_of,
    version: u.version,
    status: u.status,
    file_path: null,
    file_name: u.file,
    summary: u.summary,
    prev_summary: u.prev_summary ?? null,
    uploaded_at: parseAuTimestamp(u.uploaded) ?? new Date().toISOString(),
  }));
}

let fixtureIdSeq = 1;

/** In-memory twin of the ingest-report Edge Function (prototype confirmUpload). */
export function fixtureIngest(
  clientSlug: string,
  fileName: string,
  rawText: string,
): { ok: true; message: string; monthKey: string } | { ok: false; error: string } {
  const c = clients.find((x) => x.id === clientSlug);
  if (!c) return { ok: false, error: "Unknown client." };

  const parsed = detectAndParse(rawText);
  if (isParseError(parsed)) return { ok: false, error: parsed.error };

  // month state from the flat handoff-shaped month object
  const existing = c.months[parsed.monthKey];
  const state = applyUpload(
    parsed,
    existing && existing.metrics != null
      ? {
          status: existing.status,
          budget: existing.budget ?? 0,
          target_cpl: existing.target_cpl ?? 0,
          days_elapsed: existing.days_elapsed ?? 0,
          days_in_month: existing.days_in_month ?? 0,
          report: Object.fromEntries(
            REPORT_KEYS.filter((k) => k in existing).map((k) => [k, existing[k]]),
          ),
        }
      : null,
  );

  // upload versioning (prototype: archive prev Current, unshift new row)
  const ups = (c.report_uploads = c.report_uploads ?? []);
  const kind = parsed.kind;
  const prevCur = ups.find((u) => u.type === kind && u.status === "Current");
  if (prevCur) prevCur.status = "Archived";
  ups.unshift({
    id: `fix_u${fixtureIdSeq++}`,
    type: kind,
    as_of: parsed.asOf,
    uploaded: "Just now",
    file: fileName,
    status: "Current",
    version: prevCur ? prevCur.version + 1 : 1,
    summary: parsed.summary,
    prev_summary: prevCur ? prevCur.summary : undefined,
  });

  // write the month back in handoff shape
  const target = (c.months[parsed.monthKey] =
    c.months[parsed.monthKey] ?? ({} as HandoffMonth));
  target.label = target.label ?? monthName(parsed.monthKey);
  target.status = (existing?.status ?? state.status) as MonthStatus;
  target.updated = `${parsed.asOf} · from upload`;
  target.budget = state.budget;
  target.target_cpl = state.target_cpl;
  target.days_elapsed = state.days_elapsed;
  target.days_in_month = state.days_in_month;
  Object.assign(target, state.report);

  return {
    ok: true,
    monthKey: parsed.monthKey,
    message: `${kind} saved as Current for ${target.label}${prevCur ? `. v${prevCur.version} archived.` : "."}`,
  };
}
