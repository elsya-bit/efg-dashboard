/**
 * Seed script — EFG client report dashboard.
 *
 * Reseeds public.clients / public.months / public.report_uploads (plus the
 * 'client-logos' and 'report-uploads' storage buckets) from the design
 * handoff dataset in handoff/report-data.js.
 *
 * Run from the repo root:
 *   npx tsx scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Reseed semantics: existing clients rows with the same slugs are deleted first
 * (FK cascade wipes their months and report_uploads), then everything is
 * inserted fresh. Storage objects are overwritten via upsert.
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { DB } from '../handoff/report-data.js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing required environment variables in .env.local:\n' +
      (SUPABASE_URL ? '' : '  - NEXT_PUBLIC_SUPABASE_URL\n') +
      (SERVICE_ROLE_KEY ? '' : '  - SUPABASE_SERVICE_ROLE_KEY\n') +
      'Add them to .env.local and re-run: npx tsx scripts/seed.ts',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// handoff/report-data.js is plain untyped ESM — treat the whole dataset as any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = DB as any;

const HANDOFF_DIR = path.resolve(process.cwd(), 'handoff');
const UPLOADS_DIR = path.join(HANDOFF_DIR, 'uploads');

const LOGO_BUCKET = 'client-logos';
const UPLOAD_BUCKET = 'report-uploads';

/** report-data upload type label -> report_uploads.type enum value */
const UPLOAD_TYPE: Record<string, string> = {
  'Meta Dashboard': 'meta_dashboard',
  'Daily Tracker': 'daily_tracker',
  'A/B Testing': 'ab_testing',
};

/** Keys copied verbatim from a month object into the months.report jsonb blob. */
const REPORT_KEYS = [
  'summary',
  'metrics',
  'prev',
  'cpl_trend',
  'tracker',
  'ab_log',
  'campaigns',
  'creatives',
  'audiences',
  'actions',
  'changed',
  'attention',
  'working',
  'notes',
] as const;

const MONTH_NUM: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

// All human-readable timestamps in the dataset fall in May–July, when
// Australia/Sydney is on AEST (UTC+10:00, no daylight saving).
const SYDNEY_OFFSET = '+10:00';

function bail(context: string, error: unknown): never {
  console.error(`\n[seed] FAILED — ${context}`);
  console.error(error);
  process.exit(1);
}

/** '6 Jul 2026' -> '2026-07-06' */
function toIsoDate(s: string): string {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s.trim());
  const mon = m && MONTH_NUM[m[2].toLowerCase()];
  if (!m || !mon) bail(`cannot parse date string "${s}"`, new Error('unrecognised date format'));
  return `${m[3]}-${mon}-${m[1].padStart(2, '0')}`;
}

/** '5 Jul 2026, 9:12am' (Australia/Sydney, +10:00) -> UTC ISO timestamp */
function toIsoTimestamp(s: string): string {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s.trim());
  const mon = m && MONTH_NUM[m[2].toLowerCase()];
  if (!m || !mon) bail(`cannot parse timestamp string "${s}"`, new Error('unrecognised timestamp format'));
  let hour = parseInt(m[4], 10) % 12;
  if (m[6].toLowerCase() === 'pm') hour += 12;
  const local = `${m[3]}-${mon}-${m[1].padStart(2, '0')}T${String(hour).padStart(2, '0')}:${m[5]}:00${SYDNEY_OFFSET}`;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) bail(`invalid timestamp "${s}" -> "${local}"`, new Error('invalid date'));
  return date.toISOString();
}

/**
 * Assemble the months.report jsonb value: only the REPORT_KEYS actually present
 * on the month object (Planned months carry none of them -> null).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildReport(month: any): Record<string, unknown> | null {
  const report: Record<string, unknown> = {};
  let hasAny = false;
  for (const key of REPORT_KEYS) {
    if (key in month) {
      report[key] = month[key];
      hasAny = true;
    }
  }
  return hasAny ? report : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedClient(c: any): Promise<void> {
  const slug: string = c.id;
  console.log(`\n=== ${c.name} (${slug}) ===`);

  let storagePushed = 0;

  // 1. Reseed: delete any existing client with this slug; FK cascade removes
  //    its months and report_uploads rows.
  {
    const { error } = await supabase.from('clients').delete().eq('slug', slug);
    if (error) bail(`deleting existing client "${slug}"`, error);
  }

  // 2. Logo (only clients that ship one in the handoff bundle).
  let logoPath: string | null = null;
  if (c.logo) {
    const localLogo = path.join(HANDOFF_DIR, c.logo);
    if (!fs.existsSync(localLogo)) {
      bail(`logo for "${slug}"`, new Error(`file not found: ${localLogo}`));
    }
    const dest = `${slug}.png`;
    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(dest, fs.readFileSync(localLogo), { upsert: true, contentType: 'image/png' });
    if (error) bail(`uploading logo "${dest}" to ${LOGO_BUCKET}`, error);
    logoPath = dest;
    storagePushed += 1;
  }

  // 3. Client row.
  const { data: insertedClient, error: clientError } = await supabase
    .from('clients')
    .insert({
      slug,
      name: c.name,
      initials: c.initials,
      industry: c.industry,
      objective: c.objective,
      manager: c.manager,
      contact: c.contact,
      contact_role: c.contact_role,
      accent_colour: c.colour,
      logo_path: logoPath,
      currency: c.currency,
    })
    .select('id')
    .single();
  if (clientError || !insertedClient) {
    bail(`inserting client "${slug}"`, clientError ?? new Error('no row returned'));
  }
  const clientId: string = insertedClient.id;

  // 4. Months. Key '2026-07' -> month date '2026-07-01'.
  const monthKeys = Object.keys(c.months ?? {}).sort();
  const monthRows = monthKeys.map((key) => {
    const m = c.months[key];
    return {
      client_id: clientId,
      month: `${key}-01`,
      status: m.status,
      budget: m.budget ?? null,
      target_cpl: m.target_cpl ?? null,
      days_in_month: m.days_in_month ?? null,
      days_elapsed: m.days_elapsed ?? null,
      report: buildReport(m),
      updated_at: m.updated ? toIsoTimestamp(m.updated) : new Date().toISOString(),
    };
  });
  if (monthRows.length > 0) {
    const { error } = await supabase.from('months').insert(monthRows);
    if (error) bail(`inserting ${monthRows.length} months for "${slug}"`, error);
  }

  // 5. Report uploads. Files present in handoff/uploads/ are pushed to storage;
  //    rows whose file is missing from the bundle are inserted with file_path null.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uploads: any[] = c.report_uploads ?? [];
  const uploadRows = [];
  for (const u of uploads) {
    const type = UPLOAD_TYPE[u.type];
    if (!type) bail(`upload ${u.id} for "${slug}"`, new Error(`unknown upload type "${u.type}"`));

    let filePath: string | null = null;
    const localFile = u.file ? path.join(UPLOADS_DIR, u.file) : null;
    if (localFile && fs.existsSync(localFile)) {
      const dest = `${slug}/${type}/v${u.version}-${u.file}`;
      const { error } = await supabase.storage
        .from(UPLOAD_BUCKET)
        .upload(dest, fs.readFileSync(localFile), { upsert: true, contentType: 'application/json' });
      if (error) bail(`uploading "${dest}" to ${UPLOAD_BUCKET}`, error);
      filePath = dest;
      storagePushed += 1;
    } else {
      console.warn(
        `   ! ${u.id} (${u.type} v${u.version}): "${u.file}" not found in handoff/uploads — inserting row with file_path = null`,
      );
    }

    uploadRows.push({
      client_id: clientId,
      type,
      as_of: toIsoDate(u.as_of),
      version: u.version,
      status: u.status,
      file_path: filePath,
      summary: u.summary ?? null,
      prev_summary: u.prev_summary ?? null,
      uploaded_by: null,
      uploaded_at: toIsoTimestamp(u.uploaded),
    });
  }
  if (uploadRows.length > 0) {
    const { error } = await supabase.from('report_uploads').insert(uploadRows);
    if (error) bail(`inserting ${uploadRows.length} report_uploads for "${slug}"`, error);
  }

  console.log(`   months inserted:  ${monthRows.length} (${monthKeys.join(', ') || 'none'})`);
  console.log(`   uploads inserted: ${uploadRows.length}`);
  console.log(`   storage pushed:   ${storagePushed}`);
}

async function main(): Promise<void> {
  console.log(`Seeding ${db.clients.length} clients into ${SUPABASE_URL}`);
  for (const client of db.clients) {
    await seedClient(client);
  }
  console.log('\nSeed complete.');
}

main().catch((err) => {
  bail('unexpected error', err);
});
