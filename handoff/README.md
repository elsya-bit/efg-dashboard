# Handoff: EFG Consulting Client Portal — Meta Ads Reporting Dashboard

## Overview

A multi-client Meta Ads reporting portal for EFG Consulting (a paid-media agency). The internal team ingests daily JSON report exports (produced by Claude + Pipeboard Meta Ads MCP), reviews each month's report, and publishes it. Clients log in and see **only their own published data**, presented with plain-English explanations.

Two audiences, one app:
- **Internal (EFG staff)** — all clients, all months (including drafts), admin workspace (pipeline, review desk, client settings), report uploads, budget planning, internal-only analysis notes.
- **Client** — their own dashboard only, published months only. No admin chrome, no internal reasoning, no draft data. Ever.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype showing the intended look, copy, and behavior. They are NOT production code to copy directly.

Your task is to **recreate this design in a real codebase** using its established patterns. There is no existing codebase, so the recommended stack (given the client has Supabase and GitHub) is:

- **Next.js (App Router) + React + TypeScript**, deployed on Vercel (or similar)
- **Supabase**: Postgres (data), Auth (logins + roles), Storage (raw report JSON files), Row Level Security (client isolation)
- Styling: Tailwind or CSS-in-JS — match the design tokens below exactly

The prototype's single source file is `EFG Client Portal.dc.html`. Its `<x-dc>` template section defines all markup/styling inline; the `class Component` script at the bottom contains **every business rule** (pacing math, status lifecycles, upload versioning, ingestion mappings). Port the rules, not the code. `report-data.js` is the seed dataset and doubles as the reference data model. Open `EFG Client Portal.dc.html` in a browser to interact with the prototype.

## Fidelity

**High-fidelity.** Colors, typography, spacing, copy, and interactions are final and should be recreated pixel-faithfully. All numbers shown are real Capital Transport July 2026 data flowing from the three JSON sample files in `uploads/`.

One deliberate formatting rule: **actual spend amounts always show 2 decimals** (e.g. `$3,629.06`); **planned budgets and forecasts show whole dollars** (e.g. `$25,575`, "near $28,125"). Currency is AUD, `en-AU` thousands separators.

## Information Architecture

**Top bar** (sticky, 62px, white, 1px #D0E8E2 bottom border): EFG wordmark · "Internal" badge (internal only) · client switcher (internal only) · month switcher (clients see published months only; internal sees all with status suffix) · "Add report" button (internal) · Export PDF (window.print; print CSS hides nav/chrome) · Admin tab (internal) · "View as client" / "Back to internal" toggle.

**Draft banner** (dark #162E27 strip under top bar, internal only): shown when the selected month's report status ≠ Published — "This {month} report is not published yet. Clients still see the last published month." + Open review desk button.

**Left sidebar** (210px, #162E27, white/muted text; collapses to a mobile nav under 960px):
1. Overview
2. Campaigns
3. Budget
4. Daily Tracker
5. A/B Testing
6. Actions
7. Creative
8. Reports
Below nav: "Your EFG contact" card (#1E4D40) with manager name + mailto button.

**Admin workspace** (internal only) with three tabs: **Pipeline** (all-clients grid: status chips, publish counts), **Review desk** (per-client month cards, Draft › Approved › Published workflow buttons), **Client settings** (client details, accent colour swatches, budget & target history CRUD, report uploads manager, delete client).

## Screens

### 1. Overview
- Client identity row (46px rounded logo/initials block + name + industry/meta line).
- **Hero card** (#1E4D40, radius 18, shadow `0 6px 18px rgba(22,46,39,.14)`): "{Month} at a glance" eyebrow (11px Poppins 600, letter-spacing .12em, uppercase, #D0E8E2), narrative summary (19px Poppins 500, white), 3 pill chips, and a "Recommended next step" sub-panel (rgba(230,243,240,.1) bg, 1px rgba(208,232,226,.28) border).
- **Metric cards grid** (5 columns, 2 rows; `repeat(2,1fr)` under 960px, 1 column under 560px): Monthly budget, Spend to date, Budget remaining, Budget pacing, Total leads, Cost per lead, Target CPL, Click rate · CTR, Cost per click, Conversion rate. Each card: uppercase 10.5px label, 23px Poppins 600 value, 11.5px delta line, muted explainer sentence (hidden when `showExplainers` is off). Cards click through to their detail screen.
- **Budget this month** card: progress bar (#1E4D40 fill on #F3F8F6 track, radius 10) with an "expected by today" tick (2px, #162E27 at 55% opacity) and label; 4 mini stats (Spent so far / Expected by today / Remaining / Forecast month end); "What this means." explainer strip (#E6F3F0).
- **Cost per lead** card: big CPL value (34px) vs target, chip "$X.XX under/over target" (solid #1E4D40 when under, white/#C53030 outline when over), daily CPL bar chart with dashed target line.
- **Daily budget · last 7 days** card: numeric table — columns `Date | VIC | NSW | QLD | SA | WA | Boost | Test | Daily total | MTD`, all amounts 2-decimal. Sourced from the latest Daily Tracker upload. If >7 days recorded, a "View all N days" button navigates to Daily Tracker. Footnote links to the Daily Tracker screen.
- **Needs attention / Working well** two-column cards.
- Footer note strips (attribution caveats etc., from report `notes`).

### 2. Campaigns
Table of campaigns: name, objective, status chip, spend ($2dp), leads, CPL (red #C53030 when above target), CTR, CPC, health chip (Strong = solid #1E4D40; Above target/Over target = attention style; Near target = soft). Rows expand to show plain-English "quality" note + recommended action.

### 3. Budget
Budget bars (Monthly budget #D0E8E2 / Expected by today #4A6B62 / Actual spend #1E4D40 / Forecast dashed — red-dashed border when over budget), narrative "what this means" strips, range chips (This month / Last 3 months / All history / Upcoming), history table (spend 2dp, leads, CPL 2dp per month), plus the CPL trend.

### 4. Daily Tracker
- 5 stat cards: Spend month to date, Budget remaining, Average daily spend, Planned daily budget (all 2dp), Days recorded.
- Full-month table (horizontal scroll, min-width 900px): `Date | VIC | NSW | QLD | SA | WA | Boost | Test | [pacing bar] | Daily | MTD | Remaining`. Bar = day total vs biggest day (#1E4D40 fill), tick = planned daily budget (monthly budget ÷ days in month).
- Empty state when no tracker upload exists for the month.

### 5. A/B Testing
Driven entirely by the A/B Testing Log upload:
- Subtitle shows analysis window + comparison window ("From the A/B Testing Log upload · window 23 Jun 2026 – 6 Jul 2026, checked against 9 Jun 2026 – 22 Jun 2026").
- 4 stat cards: Tests detected, With a verdict, Still gathering data, Target cost per result.
- "Across all tests" summary card (the log's `overall_ai_summary`).
- One card per test: title + meta line (campaign group · campaign · confidence), **verdict chip** (Winner found = solid #1E4D40; No clear winner = soft grey; Needs more data = white with #4A6B62 outline) + status chip (Complete / In progress = solid).
  - Client-friendly summary line (shown when it differs from the conclusion).
  - Variant table: `Variant (+ ad name subtitle) | cost-per-result bar (shorter = cheaper; winner bar #1E4D40, others #A7CCC1) | CPR | Spend | Results | CTR | Freq | tag`. Tags: **Winner** (solid chip), **Lowest cost** (soft chip, when no clear winner), **Highest cost** (red text label).
  - Totals line: "Test total · $X spend · N results · $X.XX average cost per result · shorter bar = cheaper result".
  - **Conclusion.** strip (#E6F3F0) and **Next step.** strip (#F3F8F6).
  - **Internal-only** dashed-border strip: "How the log reads it · internal." with the log's technical `reasoning`. Never rendered for clients.

### 6. Actions
Kanban-style columns: Urgent / This week / Monitor / Completed. Cards: title, why, owner, priority, due date, expected impact. Internal can move/complete; clients read.

### 7. Creative
Best/worst performing creatives with tags, CPL, CTR, frequency, notes and recommendations; top audiences table (spend 2dp, CPL 2dp, red when above target).

### 8. Reports
Month list with status chips; each row opens that month. Clients: published months only ("Nothing updates behind your back" copy). Internal: all months incl. planned.

### Admin › Client settings (key screen for operations)
- Client details (name, industry, manager, accent colour from 5 swatches: #2E3192 #B45309 #0E7490 #6D28D9 #1E4D40).
- **Report status workflow**: Draft › Approved › Published chips + "Save as draft" / "Approve" / "Publish to client" buttons. Publishing controls what clients can see.
- **Budget and target history**: one row per month — month label, monthly budget input, target CPL input (decimal, 2dp), result summary, **lifecycle status chip**, actions. Rules below.
- **Report uploads** manager: list of all uploads (type chip, "Data to {date} · vN", filename, one-line summary, Current/Archived status chip, Compare toggle) + **Add report** dialog.
- Danger zone: delete client (two-step confirm: Delete → Confirm, 2.6s timeout — this two-step pattern is used for ALL deletes in the app).

## Core Business Rules (port these exactly)

### Roles & visibility
- `effectiveMonth`: if the selected month has no report, fall back to latest reported. If role = client and that month isn't Published, fall back to the latest **Published** month.
- Clients never see: Draft/Approved months, admin area, internal reasoning blocks, draft banner, "Add report", client switcher.

### Report workflow (per client-month)
`Draft → Approved → Published` — set manually in the review desk / client settings. Publishing shows a toast "Published. {Client} can now see {Month}."

### Budget & target history lifecycle (derived, not stored)
- **Planned** = month has no report data yet → budget/target editable, row deletable.
- **Published** = the latest month WITH report data → budget/target still editable, openable, NOT deletable.
- **Archived** = any older month with report data → read-only text (no inputs), openable (view its report), NOT deletable.
- "Plan next month" opens a dialog pre-filled from the latest month with **Monthly budget $** and **Target CPL $** fields; creates the next calendar month as Planned.

### Report uploads (the daily ingestion loop)
Three types, uploaded as JSON by the team (daily): **Meta Dashboard**, **Daily Tracker**, **A/B Testing** (log). Per client and type:
- New upload becomes **Current**, `version = previous version + 1`; the previous Current flips to **Archived** and its summary is stored as `prev_summary` on the new row for comparison.
- **Compare** shows previous vs current vs delta, colour-coded (green = good direction, red = bad):
  - Daily Tracker: Spend MTD, Budget remaining, Days recorded, Average daily spend (neutral).
  - Meta Dashboard: Spend (neutral), Leads (up = good), CPL (down = good), CTR (up = good), CPC (down = good), Days covered.
  - A/B Testing: Tests detected, Tests with a verdict (up), Spend analysed, Results (up), Average cost per result (down).
- If the upload's month doesn't exist yet, create it as a **Draft** month shell.
- Type detection: `executive_summary` key → Meta Dashboard; `daily_tracker` array → Daily Tracker; `report_type === "ab_testing_log"` → A/B Testing. Unrecognised → error message.

### Ingestion field mappings
**Meta Dashboard** (`uploads/Capital_Transport_Meta_Ads_Dashboard_*.json`): month from `reporting_start_date`; metrics from `executive_summary` (total_spend_to_date → spend [2dp], total_leads, cost_per_lead, average_ctr, average_cpc, conversion_rate_click_to_lead, monthly_budget, target_cpl); forecast from `budget_pacing.projected_month_end_spend`; CPL trend from `daily_performance[]`; campaigns from `campaign_performance[]` (performance_status → health: "Strong Performance"=strong, "Needs Attention"=attention, else ok; plain_english_summary → quality; recommended_action → action).

**Daily Tracker** (`uploads/Capital_Transport_Daily_Budget_Tracker_*.json`): `monthly_budget`; `daily_tracker[]` rows (date, full_date, vic, nsw, qld, sa, wa, boost_spike, test, daily_total, mtd_total, budget_remaining) → tracker table; last row updates month spend (2dp) and forecast (avg daily × days in month) when it covers ≥ current days_elapsed.

**A/B Testing Log** (`uploads/CT A-B Testing Log to 6 Jul 2026.json`): month from `analysis_window.end_date`; `target_cost_per_result` → month target; `summary` (total_tests_detected, active_tests, completed_tests, tests_with_insufficient_data, overall_ai_summary); per test: test_name, campaign_group, campaign_name, test_type, status (completed → "Complete", else "In progress"), confidence_level, conclusion, recommended_next_action, client_friendly_summary, reasoning (internal-only), best/worst_performing_variable (matched against variant `ad_name`), totals, and `testing_variables[]` (variable_name stripped of "Ad: " prefix, ad_name, amount_spent, total_results, cost_per_result, ctr, frequency).
**Verdict derivation**: conclusion starts with "Clear winner" → *Winner found*; contains "insufficient_data" → *Needs more data* (display text replaces the token with "Not enough data yet."); otherwise → *No clear winner*.

### Derived metrics
- expected spend today = budget ÷ days_in_month × days_elapsed
- pacing % = (spend − expected) ÷ expected
- planned daily budget = budget ÷ days_in_month
- average daily spend = MTD ÷ days recorded
- CPL vs target chip = |target − cpl| to 2dp, "under/over target"

## Supabase Schema (suggested)

```sql
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null, industry text, manager text,
  accent_colour text, logo_url text, currency text default 'AUD'
);

create table months (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients not null,
  month date not null,                     -- first of month
  status text not null default 'Draft',    -- Draft | Approved | Published | Planned
  budget numeric(12,2), target_cpl numeric(8,2),
  days_in_month int, days_elapsed int,
  report jsonb,                            -- summary, metrics, campaigns, creatives, audiences, actions, attention, working, notes, cpl_trend, tracker, ab_log
  updated_at timestamptz default now(),
  unique (client_id, month)
);

create table report_uploads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients not null,
  type text not null,                      -- meta_dashboard | daily_tracker | ab_testing
  as_of date not null, version int not null,
  status text not null default 'Current',  -- Current | Archived
  file_path text,                          -- Supabase Storage path to raw JSON
  summary jsonb, prev_summary jsonb,
  uploaded_by uuid, uploaded_at timestamptz default now()
);

create table memberships (                 -- who can see which client
  user_id uuid references auth.users not null,
  client_id uuid references clients not null,
  role text not null,                      -- internal | client
  primary key (user_id, client_id)
);
```

RLS: internal role → all rows; client role → own `client_id` rows only AND `months.status = 'Published'`. Uploads/ingestion writes go through an Edge Function using the service role; the parsing + versioning + archive logic above lives there. Start with `report` as one JSONB blob (it mirrors the prototype's shape in `report-data.js`) — normalise later only if needed.

## Design Tokens

**Colors**
- Ink `#162E27` · Primary `#1E4D40` · Accent green `#2E6B5A` · Muted text `#4A6B62`
- Border `#D0E8E2` · Soft fill `#E6F3F0` · Page/light fill `#F3F8F6` · Faint fill `#F8FBFA` · Bar secondary `#A7CCC1`
- Danger `#C53030` (over-target, deletes, drafts count)
- Sidebar/dark surfaces `#162E27`; hero/dark cards `#1E4D40`
- Client accent swatches: `#2E3192 #B45309 #0E7490 #6D28D9 #1E4D40`

**Typography**
- Headings/buttons/chips/values: **Poppins** 500/600/700
- Body/inputs: **Lato** 400/700 (fallback 'Segoe UI', system-ui)
- Scale: page titles 20–21px/600 · card titles 15.5px/600 · hero statement 19px/500 · big values 23–34px/600 · body 13–13.5px · meta 11.5–12.5px · table headers 10.5px/600 uppercase letter-spacing .06em · chips 11px/600

**Shape & depth**
- Radii: cards 14–16px · hero 18px · inner strips 10px · buttons 8–10px · chips/pills 999px
- Shadows: card `0 1px 2px rgba(22,46,39,.05)` · hero `0 6px 18px rgba(22,46,39,.14)` · modal `0 24px 64px rgba(22,46,39,.35)` · modal overlay `rgba(22,46,39,.45)`
- Borders: 1px solid #D0E8E2 (cards), 1px dashed #D0E8E2 (internal-only blocks)

**Layout**: sidebar 210px · top bar 62px · card padding 20px · section gap 18px · breakpoints 960px (sidebar → mobile nav, 5-col grid → 2) and 560px (1 col). Print stylesheet hides nav/topbar/buttons (`.np`), white bg, no shadows.

**Status chips** (bg / text / border): Published & Current & Complete-solid `#1E4D40/#fff` · Approved `#E6F3F0/#1E4D40` · Planned `#F3F8F6/#2E6B5A` · Archived `#F3F8F6/#4A6B62` · Watch/Needs-data `#fff/#4A6B62/#4A6B62` · Needs attention `#fff/#C53030/#C53030`.

## Tweakable Props (prototype)

- `startRole`: internal | client (initial role)
- `clientAccent`: moderate | subtle | off (how strongly the client's accent colour is used)
- `showExplainers`: boolean (plain-English explainer sentences on metric cards)

Carry these forward as user/app preferences where sensible.

## Optional: AI summaries

The hero narrative, recommendations and A/B interpretations arrive **pre-written inside the JSON exports** — the portal only renders them. If you later generate them in-app, call the Anthropic API from a Supabase Edge Function (never from the browser) and cache the result on the month row; one generation per report, reviewed before publishing.

## Assets

- `assets/capital-transport-logo.png` — sample client logo (clients without a logo get an initials block in their accent colour)
- Google Fonts: Poppins (500/600/700), Lato (400/700)
- No icon library — the design is deliberately icon-free; chips and colour carry state.

## Files in this bundle

- `EFG Client Portal.dc.html` — the full hi-fi prototype (template + all business logic). Open in a browser.
- `support.js` — prototype runtime (required to open the HTML; not for production).
- `report-data.js` — seed dataset = reference data model (clients → months → report fields, report_uploads).
- `uploads/Capital_Transport_Meta_Ads_Dashboard_July2026_MTD_2026-07-05.json` — Meta Dashboard export sample.
- `uploads/Capital_Transport_Daily_Budget_Tracker_July2026_2026-07-06.json` — Daily Tracker export sample.
- `uploads/CT A-B Testing Log to 6 Jul 2026.json` — A/B Testing Log export sample.
- `assets/capital-transport-logo.png`

## Suggested build order

1. Supabase: schema + RLS + Auth (internal vs client roles), seed from `report-data.js`.
2. App shell: top bar, sidebar, role gating, month/client switching, draft banner.
3. Overview screen (hero, metric cards, budget card, CPL card, daily budget table).
4. Ingestion: upload UI + Edge Function parsers for the three JSON types, versioning/archive/compare.
5. Remaining screens: Campaigns, Budget, Daily Tracker, A/B Testing, Actions, Creative, Reports.
6. Admin: pipeline, review desk (publish workflow), client settings (budget history CRUD, uploads manager).
7. Polish: print/PDF export, responsive/mobile nav, empty states, toasts, two-step delete confirms.
