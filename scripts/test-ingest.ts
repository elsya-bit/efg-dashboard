/**
 * Ingestion core tests. Oracle: handoff/report-data.js stores the exact
 * upload summaries and ab_log the prototype produced from these same three
 * sample files — our parsers must reproduce them.
 *
 * Run: npx tsx scripts/test-ingest.ts
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- untyped handoff dataset oracle */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {
  applyUpload,
  buildAbLog,
  compareRows,
  detectAndParse,
  isParseError,
  uploadSummaryText,
} from "../src/lib/ingest/core";
import { DB } from "../handoff/report-data.js";

const read = (f: string) =>
  fs.readFileSync(path.join("handoff", "uploads", f), "utf8");

const ct = (DB as any).clients.find((c: any) => c.id === "capital_transport");
let passed = 0;
const ok = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
};

console.log("Daily Tracker (2026-07-06):");
const tracker = detectAndParse(read("Capital_Transport_Daily_Budget_Tracker_July2026_2026-07-06.json"));
assert.ok(!isParseError(tracker), "tracker parses");
ok("detects type + month", () => {
  assert.equal(tracker.kind, "Daily Tracker");
  assert.equal(tracker.type, "daily_tracker");
  assert.equal(tracker.monthKey, "2026-07");
  assert.equal(tracker.asOf, "6 Jul 2026");
});
ok("summary matches the handoff's u3 row exactly", () => {
  assert.deepEqual(tracker.summary, ct.report_uploads.find((u: any) => u.id === "u3").summary);
});
ok("summary line matches prototype format", () => {
  assert.equal(uploadSummaryText("Daily Tracker", tracker.summary), "$5,591.42 MTD over 6 days");
});
ok("month patch: budget, tracker rows, spend/forecast from last row", () => {
  const s = applyUpload(tracker, null);
  assert.equal(s.created, true);
  assert.equal(s.status, "Draft");
  assert.equal(s.budget, 25575);
  assert.equal(s.days_elapsed, 6);
  assert.equal(s.days_in_month, 31);
  assert.equal(s.report.tracker!.length, 6);
  assert.deepEqual(s.report.tracker, ct.months["2026-07"].tracker);
  assert.equal(s.report.metrics!.spend, 5591.42);
  assert.equal(s.report.metrics!.forecast, Math.round(931.9 * 31)); // 28889
});
ok("stale tracker (fewer days than existing) leaves spend untouched", () => {
  const existing = applyUpload(tracker, null);
  const stale = structuredClone(tracker);
  (stale.raw as any).daily_tracker = (stale.raw as any).daily_tracker.slice(0, 3);
  const reparsed = detectAndParse(JSON.stringify(stale.raw));
  assert.ok(!isParseError(reparsed));
  const s2 = applyUpload(reparsed, existing);
  assert.equal(s2.days_elapsed, 6);
  assert.equal(s2.report.metrics!.spend, 5591.42);
  assert.equal(s2.report.tracker!.length, 3); // tracker table itself updates
});

console.log("Meta Dashboard (2026-07-05):");
const meta = detectAndParse(read("Capital_Transport_Meta_Ads_Dashboard_July2026_MTD_2026-07-05.json"));
assert.ok(!isParseError(meta), "meta parses");
ok("detects type + month + days", () => {
  assert.equal(meta.kind, "Meta Dashboard");
  assert.equal(meta.monthKey, "2026-07");
  assert.equal(meta.summary.days, 5);
});
ok("summary from executive_summary", () => {
  assert.deepEqual(meta.summary, {
    spend: 4648, leads: 407, cpl: 11.42, ctr: 2.06, cpc: 0.62, days: 5,
  });
});
ok("month patch: budget/target/forecast/campaigns/cpl_trend/health", () => {
  const s = applyUpload(meta, null);
  assert.equal(s.budget, 25575);
  assert.equal(s.target_cpl, 16.42);
  assert.equal(s.days_elapsed, 5);
  assert.equal(s.report.metrics!.forecast, 28818); // round(28817.6)
  assert.equal(s.report.metrics!.conv, 12.0);
  assert.equal(s.report.campaigns!.length, 10);
  const nsw = s.report.campaigns![0];
  assert.equal(nsw.name, "NSW Campaigns");
  assert.equal(nsw.health, "attention");
  assert.equal(nsw.status, "Active");
  assert.equal(s.report.cpl_trend!.length, 5);
  assert.deepEqual(s.report.cpl_trend![0], { label: "1 Jul", val: 12.57 });
  assert.equal(s.report.summary!.health, "Watch"); // Overspend Risk
});

console.log("A/B Testing Log (to 6 Jul 2026):");
const ab = detectAndParse(read("CT A-B Testing Log to 6 Jul 2026.json"));
assert.ok(!isParseError(ab), "ab parses");
ok("summary matches the handoff's u4 row exactly", () => {
  assert.deepEqual(ab.summary, ct.report_uploads.find((u: any) => u.id === "u4").summary);
});
ok("buildAbLog reproduces the handoff ab_log exactly", () => {
  const built = buildAbLog(ab.raw);
  assert.deepEqual(built, ct.months["2026-07"].ab_log);
});
ok("applyUpload sets ab_log + target", () => {
  const s = applyUpload(ab, null);
  assert.equal(s.target_cpl, 16.42);
  assert.equal(s.report.ab_log!.tests.length, 3);
});

console.log("compareRows:");
ok("daily tracker v1→v2 deltas (all neutral)", () => {
  const u3 = ct.report_uploads.find((u: any) => u.id === "u3");
  const rows = compareRows("daily_tracker", u3.prev_summary, u3.summary);
  assert.deepEqual(rows.map((r) => [r.label, r.prev, r.cur, r.delta, r.colour]), [
    ["Spend month to date", "$4,652.11", "$5,591.42", "+$939.31", "#4A6B62"],
    ["Budget remaining", "$20,922.89", "$19,983.58", "−$939.31", "#4A6B62"],
    ["Days recorded", "5", "6", "+1", "#4A6B62"],
    ["Average daily spend", "$930.42", "$931.90", "+$1.48", "#4A6B62"],
  ]);
});
ok("meta dashboard directions colour-code (leads up good, cpl down good)", () => {
  const rows = compareRows("meta_dashboard",
    { spend: 3629.06, leads: 329, cpl: 11.03, ctr: 2.14, cpc: 0.61, days: 4 },
    meta.summary,
  );
  const byLabel = Object.fromEntries(rows.map((r) => [r.label, r]));
  assert.equal(byLabel["Leads"].delta, "+78");
  assert.equal(byLabel["Leads"].colour, "#1E4D40");
  assert.equal(byLabel["Cost per lead"].delta, "+$0.39");
  assert.equal(byLabel["Cost per lead"].colour, "#C53030");
  assert.equal(byLabel["Click rate"].delta, "−0.08%");
  assert.equal(byLabel["Click rate"].colour, "#C53030");
  assert.equal(byLabel["Days covered"].colour, "#4A6B62");
});

console.log("errors:");
ok("invalid JSON rejected", () => {
  const r = detectAndParse("{nope");
  assert.ok(isParseError(r) && r.error.includes("not valid JSON"));
});
ok("unrecognised format rejected", () => {
  const r = detectAndParse(JSON.stringify({ hello: "world" }));
  assert.ok(isParseError(r) && r.error.startsWith("Unrecognised format"));
});

console.log(`\nAll ${passed} ingest tests passed.`);
