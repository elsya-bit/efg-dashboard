/**
 * Shape of months.report (jsonb) — mirrors the handoff dataset
 * (handoff/report-data.js), which is the reference data model.
 */

export type ReportSummary = {
  health: string;
  text: string;
  recommendation: string;
  pills: string[];
};

export type ReportMetrics = {
  spend: number;
  leads: number;
  cpl: number;
  ctr: number;
  cpc: number;
  conv: number;
  forecast: number;
};

export type PrevMetrics = Partial<ReportMetrics> & { label?: string };

export type CplTrendPoint = { label: string; val: number };

export type TrackerDay = {
  date: number;
  full_date?: string;
  vic: number;
  nsw: number;
  qld: number;
  sa: number;
  wa: number;
  boost_spike: number;
  test: number;
  daily_total: number;
  mtd_total: number;
  budget_remaining: number;
};

export type ReportCampaign = {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
  leads: number;
  cpl: number;
  ctr: number;
  cpc: number;
  health: "strong" | "attention" | "ok";
  healthLabel: string;
  quality: string;
  action: string;
};

export type ReportCreative = {
  id: string;
  name: string;
  type: string;
  tag: "best" | "fatigue" | "worst";
  tagLabel: string;
  cpl: number;
  ctr: number;
  freq: number;
  note: string;
  rec: string;
};

export type ReportAudience = {
  name: string;
  spend: number;
  leads: number;
  cpl: number;
  note: string;
};

export type ReportAction = {
  id: string;
  title: string;
  why: string;
  owner: string;
  priority: "High" | "Medium" | "Low";
  due: string;
  status: "urgent" | "week" | "monitor" | "done";
  impact: string;
  keep: boolean;
};

export type ReportChanged = { area: string; chip: string; detail: string };

export type ReportAttention = {
  issue: string;
  impact: string;
  step: string;
  priority: "High" | "Medium" | "Low";
};

export type ReportWorking = { title: string; detail: string };

export type ReportNote = { id?: string; text: string; visible: boolean };

/** A/B testing log (consumed in Phase 5). */
export type AbVariant = {
  name: string;
  ad: string;
  spend: number;
  results: number;
  cpr: number;
  ctr: number;
  freq: number;
};

export type AbTest = {
  id: string;
  name: string;
  group: string;
  campaign: string;
  type: string;
  status: "Complete" | "In progress";
  confidence: string;
  verdict: "winner" | "data" | "none";
  conclusion: string;
  next: string;
  client: string;
  reasoning: string;
  best: string | null;
  worst: string | null;
  spend: number;
  results: number;
  avg: number;
  variants: AbVariant[];
};

export type AbLog = {
  target: number;
  windowText: string;
  summary: {
    detected: number;
    active: number;
    completed: number;
    gathering: number;
    text: string;
  };
  tests: AbTest[];
};

export type MonthReport = {
  summary?: ReportSummary;
  metrics?: ReportMetrics;
  prev?: PrevMetrics | null;
  cpl_trend?: CplTrendPoint[];
  tracker?: TrackerDay[];
  ab_log?: AbLog | null;
  campaigns?: ReportCampaign[];
  creatives?: ReportCreative[];
  audiences?: ReportAudience[];
  actions?: ReportAction[];
  changed?: ReportChanged[];
  attention?: ReportAttention[];
  working?: ReportWorking[];
  notes?: ReportNote[];
};

/** The keys stored inside months.report — used by loaders to pick fields. */
export const REPORT_KEYS = [
  "summary",
  "metrics",
  "prev",
  "cpl_trend",
  "tracker",
  "ab_log",
  "campaigns",
  "creatives",
  "audiences",
  "actions",
  "changed",
  "attention",
  "working",
  "notes",
] as const;
