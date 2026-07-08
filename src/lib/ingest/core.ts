// .ts extensions so the Deno-bundled Edge Function can share this module
import { fmtIso, money2 } from "../format.ts";
import type { AbLog, MonthReport, ReportCampaign } from "../portal/report-types.ts";

/**
 * Pure ingestion core, ported 1:1 from the prototype's ingestText() /
 * confirmUpload() / buildAbLog() / compareRows() (handoff/EFG Client
 * Portal.dc.html). No platform APIs — shared by the Supabase Edge Function
 * (Deno), the Next server action, the dev fixture executor, and the tests.
 */

export type UploadKind = "Meta Dashboard" | "Daily Tracker" | "A/B Testing";

export type UploadType = "meta_dashboard" | "daily_tracker" | "ab_testing";

export const KIND_TO_TYPE: Record<UploadKind, UploadType> = {
  "Meta Dashboard": "meta_dashboard",
  "Daily Tracker": "daily_tracker",
  "A/B Testing": "ab_testing",
};

export const TYPE_TO_KIND: Record<UploadType, UploadKind> = {
  meta_dashboard: "Meta Dashboard",
  daily_tracker: "Daily Tracker",
  ab_testing: "A/B Testing",
};

export type UploadSummary = Record<string, number>;

export type ParsedUpload = {
  kind: UploadKind;
  type: UploadType;
  /** '2026-07' */
  monthKey: string;
  /** ISO date the data runs to, e.g. '2026-07-06' */
  asOfIso: string;
  /** Display form, e.g. '6 Jul 2026' */
  asOf: string;
  summary: UploadSummary;
  raw: Record<string, unknown>;
};

export type ParseError = { error: string };

const UNRECOGNISED =
  "Unrecognised format. Expected a Meta Ads Dashboard, Daily Budget Tracker or A/B Testing Log export.";

const round2 = (n: number) => Math.round(n * 100) / 100;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Prototype ingestText(): detect the export type and build its summary. */
export function detectAndParse(text: string): ParsedUpload | ParseError {
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: "That file is not valid JSON." };
  }

  let parsed: Omit<ParsedUpload, "type"> | null = null;
  if (json && json.executive_summary) {
    const es = json.executive_summary;
    parsed = {
      kind: "Meta Dashboard",
      raw: json,
      monthKey: String(json.reporting_start_date || "").slice(0, 7),
      asOfIso: String(json.reporting_end_date || ""),
      asOf: fmtIso(json.reporting_end_date),
      summary: {
        spend: round2(es.total_spend_to_date || 0),
        leads: es.total_leads || 0,
        cpl: es.cost_per_lead || 0,
        ctr: es.average_ctr || 0,
        cpc: es.average_cpc || 0,
        days:
          parseInt(String(json.reporting_end_date || "0-0-0").split("-")[2], 10) ||
          0,
      },
    };
  } else if (json && Array.isArray(json.daily_tracker) && json.daily_tracker.length) {
    const dt = json.daily_tracker;
    const last = dt[dt.length - 1];
    parsed = {
      kind: "Daily Tracker",
      raw: json,
      monthKey: String((json.reporting_period || {}).start || "").slice(0, 7),
      asOfIso: String((json.reporting_period || {}).end || ""),
      asOf: fmtIso((json.reporting_period || {}).end),
      summary: {
        mtd: last.mtd_total || 0,
        remaining: last.budget_remaining || 0,
        days: dt.length,
        avg: round2((last.mtd_total || 0) / dt.length),
      },
    };
  } else if (json && json.report_type === "ab_testing_log") {
    const tests: any[] = json.ab_tests || [];
    const spend = round2(
      tests.reduce((a, t) => a + (t.total_amount_spent || 0), 0),
    );
    const results = tests.reduce((a, t) => a + (t.total_results || 0), 0);
    const w = json.analysis_window || {};
    parsed = {
      kind: "A/B Testing",
      raw: json,
      monthKey: String(w.end_date || "").slice(0, 7),
      asOfIso: String(w.end_date || ""),
      asOf: fmtIso(w.end_date),
      summary: {
        tests: (json.summary || {}).total_tests_detected || tests.length,
        completed: (json.summary || {}).completed_tests || 0,
        spend,
        results,
        avg: results ? round2(spend / results) : 0,
      },
    };
  }

  if (!parsed || !parsed.monthKey) {
    return { error: UNRECOGNISED };
  }
  return { ...parsed, type: KIND_TO_TYPE[parsed.kind] };
}

export function isParseError(
  p: ParsedUpload | ParseError,
): p is ParseError {
  return (p as ParseError).error !== undefined;
}

/** Prototype buildAbLog(): the month's A/B testing view model. */
export function buildAbLog(j: any): AbLog {
  const clean = (x: string) =>
    (x || "").replace(/^insufficient_data\.\s*/i, "Not enough data yet. ");
  const sm = j.summary || {};
  const w = j.analysis_window || {};
  return {
    target: j.target_cost_per_result || 0,
    windowText:
      "window " +
      fmtIso(w.start_date) +
      " – " +
      fmtIso(w.end_date) +
      ", checked against " +
      fmtIso(w.comparison_start_date) +
      " – " +
      fmtIso(w.comparison_end_date),
    summary: {
      detected: sm.total_tests_detected || 0,
      active: sm.active_tests || 0,
      completed: sm.completed_tests || 0,
      gathering: sm.tests_with_insufficient_data || 0,
      text: sm.overall_ai_summary || "",
    },
    tests: (j.ab_tests || []).map((t: any) => ({
      id: t.test_id,
      name: t.test_name,
      group: t.campaign_group || "",
      campaign: t.campaign_name || "",
      type: t.test_type || "",
      status: t.status === "completed" ? "Complete" : "In progress",
      confidence: t.confidence_level
        ? t.confidence_level.charAt(0).toUpperCase() +
          t.confidence_level.slice(1) +
          " confidence"
        : "",
      verdict: /^clear winner/i.test(t.conclusion || "")
        ? "winner"
        : /insufficient_data/i.test(t.conclusion || "")
          ? "data"
          : "none",
      conclusion: clean(t.conclusion),
      next: t.recommended_next_action || "",
      client: t.client_friendly_summary || "",
      reasoning: t.reasoning || "",
      best: t.best_performing_variable || null,
      worst: t.worst_performing_variable || null,
      spend: t.total_amount_spent || 0,
      results: t.total_results || 0,
      avg: t.average_cost_per_result || 0,
      variants: (t.testing_variables || []).map((v: any) => ({
        name: (v.variable_name || "").replace(/^Ad:\s*/, ""),
        ad: v.ad_name || "",
        spend: v.amount_spent || 0,
        results: v.total_results || 0,
        cpr: v.cost_per_result || 0,
        ctr: v.ctr || 0,
        freq: v.frequency || 0,
      })),
    })),
  };
}

export type MonthState = {
  /** true when this month didn't exist and a Draft shell was created. */
  created: boolean;
  status: string;
  budget: number;
  target_cpl: number;
  days_elapsed: number;
  days_in_month: number;
  report: MonthReport;
};

function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m, 0).getDate();
}

/** Prototype's new-month shell (days_in_month computed, not hardcoded 31). */
export function monthShell(monthKey: string, days: number): MonthState {
  return {
    created: true,
    status: "Draft",
    budget: 0,
    target_cpl: 0,
    days_elapsed: days || 0,
    days_in_month: daysInMonth(monthKey),
    report: {
      summary: {
        health: "Draft",
        text: "Generated from the first upload. Add the narrative before publishing.",
        recommendation: "",
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
    },
  };
}

/**
 * Prototype confirmUpload()'s month update rules. Takes the existing month
 * state (or null → Draft shell) and returns the new state. Does not mutate.
 */
export function applyUpload(
  parsed: ParsedUpload,
  existing: Omit<MonthState, "created"> | null,
): MonthState {
  const state: MonthState = existing
    ? { ...structuredClone(existing), created: false }
    : monthShell(parsed.monthKey, parsed.summary.days || 0);
  const mo = state;
  const report = mo.report;
  report.metrics = report.metrics ?? {
    spend: 0, leads: 0, cpl: 0, ctr: 0, cpc: 0, conv: 0, forecast: 0,
  };
  const j: any = parsed.raw;

  if (parsed.kind === "Meta Dashboard") {
    const es = j.executive_summary;
    const bp = j.budget_pacing || {};
    if (es.monthly_budget) mo.budget = Math.round(es.monthly_budget);
    if (j.target_cpl) mo.target_cpl = j.target_cpl;
    mo.days_elapsed = parsed.summary.days || mo.days_elapsed;
    Object.assign(report.metrics, {
      spend: parsed.summary.spend,
      leads: parsed.summary.leads,
      cpl: parsed.summary.cpl,
      ctr: parsed.summary.ctr,
      cpc: parsed.summary.cpc,
    });
    if (es.conversion_rate_click_to_lead != null) {
      report.metrics.conv = es.conversion_rate_click_to_lead;
    }
    if (bp.projected_month_end_spend) {
      report.metrics.forecast = Math.round(bp.projected_month_end_spend);
    }
    if (Array.isArray(j.daily_performance) && j.daily_performance.length) {
      report.cpl_trend = j.daily_performance.map((d: any) => {
        const pt = fmtIso(d.date).split(" ");
        return { label: pt[0] + " " + pt[1], val: d.cost_per_lead };
      });
    }
    if (Array.isArray(j.campaign_performance) && j.campaign_performance.length) {
      report.campaigns = j.campaign_performance.map(
        (cp: any, i: number): ReportCampaign => ({
          id: cp.campaign_id || "c" + i,
          name: cp.campaign_name,
          objective: "Leads",
          status: cp.campaign_effective_status === "ACTIVE" ? "Active" : "Paused",
          spend: round2(cp.spend || 0),
          leads: cp.leads || 0,
          cpl: cp.cost_per_lead || 0,
          ctr: cp.ctr || 0,
          cpc: cp.cpc || 0,
          health:
            cp.performance_status === "Strong Performance"
              ? "strong"
              : cp.performance_status === "Needs Attention"
                ? "attention"
                : "ok",
          healthLabel: cp.performance_status || "OK",
          quality: cp.plain_english_summary || "",
          action: cp.recommended_action || "",
        }),
      );
    }
    if (
      bp.budget_status === "Overspend Risk" &&
      report.summary &&
      report.summary.health !== "Needs Attention"
    ) {
      report.summary.health = "Watch";
    }
  } else if (parsed.kind === "Daily Tracker") {
    if (j.monthly_budget) mo.budget = Math.round(j.monthly_budget);
    if (Array.isArray(j.daily_tracker)) report.tracker = j.daily_tracker;
    if ((parsed.summary.days || 0) >= (mo.days_elapsed || 0)) {
      mo.days_elapsed = parsed.summary.days;
      report.metrics.spend = round2(parsed.summary.mtd);
      report.metrics.forecast = Math.round(
        parsed.summary.avg * (mo.days_in_month || 31),
      );
    }
  } else {
    report.ab_log = buildAbLog(j);
    if (j.target_cost_per_result) mo.target_cpl = j.target_cost_per_result;
  }

  return state;
}

/** Prototype uploadSummaryText(): the one-line summary on upload rows. */
export function uploadSummaryText(kind: UploadKind, sm: UploadSummary): string {
  if (kind === "Daily Tracker") {
    return `${money2(sm.mtd)} MTD over ${sm.days} days`;
  }
  if (kind === "A/B Testing") {
    return `${sm.tests} tests · ${money2(sm.spend)} spend · ${sm.results} results`;
  }
  return `${money2(sm.spend)} spend · ${sm.leads} leads · $${sm.cpl.toFixed(2)} CPL`;
}

export type CompareRow = {
  label: string;
  prev: string;
  cur: string;
  delta: string;
  colour: string;
};

/** Prototype compareRows(): previous vs current vs colour-coded delta. */
export function compareRows(
  type: UploadType,
  prevSummary: UploadSummary | null | undefined,
  summary: UploadSummary,
): CompareRow[] {
  const a = prevSummary;
  const b = summary;
  if (!a) return [];
  const M = (v: number) => money2(v);
  const C2 = (v: number) => "$" + v.toFixed(2);
  type Def = [string, string, (v: number) => string, "neutral" | "up" | "down"];
  const defs: Def[] =
    type === "daily_tracker"
      ? [
          ["Spend month to date", "mtd", M, "neutral"],
          ["Budget remaining", "remaining", M, "neutral"],
          ["Days recorded", "days", String, "neutral"],
          ["Average daily spend", "avg", C2, "neutral"],
        ]
      : type === "ab_testing"
        ? [
            ["Tests detected", "tests", String, "neutral"],
            ["Tests with a verdict", "completed", String, "up"],
            ["Spend analysed", "spend", M, "neutral"],
            ["Results", "results", String, "up"],
            ["Average cost per result", "avg", C2, "down"],
          ]
        : [
            ["Spend to date", "spend", M, "neutral"],
            ["Leads", "leads", String, "up"],
            ["Cost per lead", "cpl", C2, "down"],
            ["Click rate", "ctr", (v) => v + "%", "up"],
            ["Cost per click", "cpc", C2, "down"],
            ["Days covered", "days", String, "neutral"],
          ];
  return defs.map(([label, key, fmt, good]) => {
    const av = a[key];
    const bv = b[key];
    if (av == null || bv == null) {
      return {
        label,
        prev: av == null ? "—" : fmt(av),
        cur: bv == null ? "—" : fmt(bv),
        delta: "",
        colour: "#4A6B62",
      };
    }
    const d = round2(bv - av);
    const dTxt =
      d === 0
        ? "No change"
        : (d > 0 ? "+" : "−") +
          (key === "leads" || key === "days" ? Math.abs(d) : fmt(Math.abs(d)));
    let colour = "#4A6B62";
    if (d !== 0 && good === "down") colour = d < 0 ? "#1E4D40" : "#C53030";
    if (d !== 0 && good === "up") colour = d > 0 ? "#1E4D40" : "#C53030";
    return { label, prev: fmt(av), cur: fmt(bv), delta: dTxt, colour };
  });
}
