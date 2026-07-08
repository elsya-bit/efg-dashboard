import { fmtIso, money, money2 } from "@/lib/format";
import type { MonthReport, TrackerDay } from "./report-types";
import type { PortalMonth } from "./types";

/**
 * Overview derivations, ported 1:1 from the prototype's renderVals()
 * (handoff/EFG Client Portal.dc.html). Deliberate rules preserved exactly:
 * actuals 2dp, budgets/forecasts whole dollars, ±3% = "On plan",
 * paceOk within ±10%, chart height 78px inside a 108px box.
 */

export type Pacing = {
  expected: number;
  pacePct: number;
  monthDone: boolean;
  paceLabel: string;
  paceOk: boolean;
  remaining: number;
  overBudget: boolean;
  budgetMeaning: string;
  budgetMeaning2: string;
  spendPct: string;
  expectedPct: string;
  dayOf: string;
};

export function derivePacing(month: PortalMonth, report: MonthReport): Pacing {
  const budget = month.budget ?? 0;
  const daysIn = month.days_in_month ?? 0;
  const daysEl = month.days_elapsed ?? 0;
  const m = report.metrics ?? { spend: 0, forecast: 0 };
  const spend = m.spend ?? 0;
  const forecast = m.forecast ?? 0;

  const expected = daysIn ? (budget * daysEl) / daysIn : 0;
  const pacePct = expected > 0 ? Math.round((spend / expected - 1) * 100) : 0;
  const monthDone = daysEl >= daysIn;
  const paceLabel =
    budget <= 0
      ? "No budget set"
      : monthDone
        ? spend <= budget
          ? "Finished on plan"
          : "Finished over budget"
        : Math.abs(pacePct) <= 3
          ? "On plan"
          : pacePct > 0
            ? `Pacing ${pacePct}% ahead`
            : `Pacing ${Math.abs(pacePct)}% behind`;
  const paceOk = monthDone ? spend <= budget : Math.abs(pacePct) <= 10;
  const remaining = Math.max(0, budget - spend);
  const overBudget = forecast > budget;

  const budgetMeaning = monthDone
    ? `The month closed at ${money2(spend)} of the ${money(budget)} budget.`
    : `By day ${daysEl} we would expect about ${money(expected)} spent. Actual spend is ${money2(spend)}, so the month is ${
        Math.abs(pacePct) <= 3
          ? "tracking to plan."
          : pacePct > 0
            ? "running a little ahead."
            : "running a little behind."
      }`;
  const budgetMeaning2 = monthDone
    ? ""
    : overBudget
      ? `At the current rate the month ends near ${money(forecast)}, about ${money(forecast - budget)} over. We will trim daily budgets if it holds.`
      : `At the current rate the month ends near ${money(forecast)}, inside budget. No change needed.`;

  return {
    expected,
    pacePct,
    monthDone,
    paceLabel,
    paceOk,
    remaining,
    overBudget,
    budgetMeaning,
    budgetMeaning2,
    spendPct: Math.min(100, Math.round((spend / (budget || 1)) * 100)) + "%",
    expectedPct: Math.min(100, Math.round((expected / (budget || 1)) * 100)) + "%",
    dayOf: `${daysEl} of ${daysIn}`,
  };
}

export type Delta = { text: string; colour: string };

/** Prototype's D() metric-delta helper. */
export function metricDelta(
  cur: number,
  prev: number | null | undefined,
  goodWhenLower: boolean,
  unit: "$" | "%" | "",
  prevLabel: string,
): Delta {
  if (prev == null) return { text: "No prior data yet", colour: "#4A6B62" };
  const diff = cur - prev;
  const good = goodWhenLower ? diff < 0 : diff > 0;
  const arrow = diff === 0 ? "·" : diff > 0 ? "▲" : "▼";
  const val =
    unit === "$"
      ? "$" +
        Math.abs(diff).toFixed(
          Math.abs(diff) < 10 && Math.abs(diff) % 1 !== 0 ? 2 : 0,
        )
      : Math.abs(diff).toFixed(unit === "%" ? 1 : 0) + (unit === "%" ? " pts" : "");
  return {
    text: `${arrow} ${val} v ${prevLabel}`,
    colour: diff === 0 ? "#4A6B62" : good ? "#2E6B5A" : "#4A6B62",
  };
}

export type MetricCard = {
  label: string;
  value: string;
  delta: string;
  deltaColour: string;
  meaning: string;
  tag: string;
  /** Chip visual: solid | soft | watch | danger | faint */
  tagStyle: "solid" | "soft" | "watch" | "danger" | "faint";
  href: string;
};

export function deriveMetricCards(
  month: PortalMonth,
  report: MonthReport,
  pacing: Pacing,
  base: string,
): MetricCard[] {
  const m = report.metrics!;
  const p = report.prev ?? {};
  const pl = p.label ?? "last month";
  const budget = month.budget ?? 0;
  const target = month.target_cpl ?? 0;
  const daysIn = month.days_in_month ?? 0;
  const daysEl = month.days_elapsed ?? 0;
  const monthShort = month.label.split(" ")[0];
  const cplUnder = m.cpl <= target;
  const leadsStrong =
    p.leads == null || m.leads >= (p.leads * daysEl) / Math.max(1, daysIn);

  const D = (cur: number, prev: number | null | undefined, lower: boolean, unit: "$" | "%" | "") =>
    metricDelta(cur, prev, lower, unit, pl);

  const watchOr = (ok: boolean, okTag = "On track"): Pick<MetricCard, "tag" | "tagStyle"> =>
    ok ? { tag: okTag, tagStyle: "soft" } : { tag: "Watch this", tagStyle: "watch" };

  const plain = (delta: string): Delta => ({ text: delta, colour: "#4A6B62" });

  const cards: Array<
    Omit<MetricCard, "delta" | "deltaColour" | "href"> & { delta: Delta; href: string }
  > = [
    {
      label: "Monthly budget",
      value: money(budget),
      delta: plain(`Same as ${pl}`),
      meaning: "Agreed with you at the monthly review.",
      tag: "Set together",
      tagStyle: "faint",
      href: `${base}/budget`,
    },
    {
      label: "Spend to date",
      value: money2(m.spend),
      delta: plain(pacing.monthDone ? "Final" : `Day ${daysEl} of ${daysIn}`),
      meaning: "How much of the budget has been used.",
      ...watchOr(pacing.paceOk),
      href: `${base}/budget`,
    },
    {
      label: "Budget remaining",
      value: money2(pacing.remaining),
      delta: plain(pacing.monthDone ? "Month closed" : `For the rest of ${monthShort}`),
      meaning: "Left to spend this month.",
      tag: "On track",
      tagStyle: "soft",
      href: `${base}/budget`,
    },
    {
      label: "Budget pacing",
      value: pacing.monthDone
        ? "100%"
        : `${pacing.pacePct > 0 ? "+" : ""}${pacing.pacePct}%`,
      delta: plain(pacing.monthDone ? "Complete" : "v where today should be"),
      meaning: "Ahead means spending faster than planned.",
      tag: pacing.paceLabel,
      tagStyle: pacing.paceOk ? "soft" : "watch",
      href: `${base}/budget`,
    },
    {
      label: "Total leads",
      value: String(m.leads),
      delta: D(m.leads, p.leads, false, ""),
      meaning: "Enquiries your ads produced.",
      tag: leadsStrong ? "Strong" : "Watch this",
      tagStyle: leadsStrong ? "solid" : "watch",
      href: `${base}/campaigns`,
    },
    {
      label: "Cost per lead",
      value: "$" + m.cpl.toFixed(2),
      delta: D(m.cpl, p.cpl, true, "$"),
      meaning: "Average cost of each enquiry.",
      tag: cplUnder ? "Under target" : "Above target",
      tagStyle: cplUnder ? "soft" : "danger",
      href: `${base}/campaigns`,
    },
    {
      label: "Target CPL",
      value: "$" + target.toFixed(2),
      delta: plain(`Your goal for ${monthShort}`),
      meaning: "The cost per lead we aim to beat.",
      tag: cplUnder
        ? `$${Math.round((target - m.cpl) * 100) / 100} under`
        : `$${Math.round((m.cpl - target) * 100) / 100} over`,
      tagStyle: cplUnder ? "solid" : "danger",
      href: `${base}/campaigns`,
    },
    {
      label: "Click rate · CTR",
      value: m.ctr + "%",
      delta: D(m.ctr, p.ctr, false, "%"),
      meaning: "How often people click after seeing an ad.",
      ...watchOr(p.ctr == null || m.ctr >= p.ctr),
      href: `${base}/creative`,
    },
    {
      label: "Cost per click",
      value: "$" + m.cpc.toFixed(2),
      delta: D(m.cpc, p.cpc, true, "$"),
      meaning: "What each visit to your form costs.",
      ...watchOr(p.cpc == null || m.cpc <= p.cpc),
      href: `${base}/creative`,
    },
    {
      label: "Conversion rate",
      value: m.conv + "%",
      delta: D(m.conv, p.conv, false, "%"),
      meaning: "Clicks that turn into enquiries.",
      ...watchOr(p.conv == null || m.conv >= p.conv),
      href: `${base}/campaigns`,
    },
  ];

  return cards.map((c) => ({
    ...c,
    delta: c.delta.text,
    deltaColour: c.delta.colour,
  }));
}

export type CplChart = {
  bars: Array<{ label: string; val: number; h: number; bg: string }>;
  targetLineBottom: number;
  targetLineLabelBottom: number;
};

const CHART_H = 78;

export function deriveCplChart(month: PortalMonth, report: MonthReport): CplChart {
  const target = month.target_cpl ?? 0;
  const trend = report.cpl_trend ?? [];
  const trendMax = Math.max(1, target, ...trend.map((t) => t.val));
  const targetLineBottom = Math.round((target / trendMax) * CHART_H) + 16;
  return {
    bars: trend.map((t) => ({
      label: t.label,
      val: t.val,
      h: Math.max(8, Math.round((t.val / trendMax) * CHART_H)),
      bg: t.val <= target ? "#1E4D40" : "#4A6B62",
    })),
    targetLineBottom,
    targetLineLabelBottom: targetLineBottom + 4,
  };
}

/** Best (cheapest) and dearest campaigns for the CPL card footer. */
export function deriveBestWorst(report: MonthReport): {
  best: string;
  worst: string;
} {
  const sorted = [...(report.campaigns ?? [])].sort((a, b) => a.cpl - b.cpl);
  const best = sorted[0] ?? { name: "No campaigns yet", cpl: 0 };
  const worst = sorted[sorted.length - 1] ?? { name: "No campaigns yet", cpl: 0 };
  return {
    best: `${best.name.split(" ·")[0]} $${best.cpl}`,
    worst: `${worst.name.split(" ·")[0]} $${worst.cpl}`,
  };
}

export type TrackerRow = {
  day: string;
  vic: string;
  nsw: string;
  qld: string;
  sa: string;
  wa: string;
  boost: string;
  test: string;
  total: string;
  mtd: string;
  left: string;
  /** Day total vs biggest day, 0-100. */
  pct: number;
};

export function trackerRow(d: TrackerDay, maxDaily: number): TrackerRow {
  const pt = d.full_date ? fmtIso(d.full_date).split(" ") : null;
  return {
    day: pt ? `${pt[0]} ${pt[1]}` : `Day ${d.date}`,
    vic: money2(d.vic),
    nsw: money2(d.nsw),
    qld: money2(d.qld),
    sa: money2(d.sa),
    wa: money2(d.wa),
    boost: money2(d.boost_spike),
    test: money2(d.test),
    total: money2(d.daily_total),
    mtd: money2(d.mtd_total),
    left: money2(d.budget_remaining),
    pct: Math.min(100, Math.round((d.daily_total / maxDaily) * 100)),
  };
}

export type TrackerView = {
  hasTracker: boolean;
  rows: TrackerRow[];
  recent: TrackerRow[];
  moreCount: number;
  dailyTargetText: string;
  asOf: string;
};

export function deriveTracker(month: PortalMonth, report: MonthReport): TrackerView {
  const all = report.tracker ?? [];
  const daysIn = month.days_in_month ?? 0;
  const dailyTarget = daysIn ? (month.budget ?? 0) / daysIn : 0;
  const maxDaily = all.reduce((mx, d) => Math.max(mx, d.daily_total), 1);
  const rows = all.map((d) => trackerRow(d, maxDaily));
  const recent = rows.slice(-7);
  return {
    hasTracker: all.length > 0,
    rows,
    recent,
    moreCount: all.length > 7 ? all.length : 0,
    dailyTargetText: money2(dailyTarget),
    asOf: recent.length ? recent[recent.length - 1].day : "",
  };
}
