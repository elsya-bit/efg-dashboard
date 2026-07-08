import { monthName } from "@/lib/format";
import type { MonthStatus, PortalClient, PortalMonth } from "./types";
import type { ProviderSession } from "./supabase-provider";

/**
 * Dev-only data provider backed by the design-handoff dataset, so the shell
 * and screens can be rendered (and screenshot-compared against the
 * prototype) without a reachable Supabase project.
 *
 * Enabled only when EFG_DEV_FIXTURES=1 and not in a production build — see
 * fixturesEnabled() in ./index.ts. Never enable in production: it bypasses
 * authentication.
 */

import { DB } from "../../../handoff/report-data.js";

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
};

const clients: HandoffClient[] = (DB as unknown as { clients: HandoffClient[] })
  .clients;

/** '5 Jul 2026, 9:12am' (Australia/Sydney, +10 in July) → ISO string. */
function parseUpdated(text: string | undefined): string | null {
  if (!text) return null;
  const m = text.match(/^(\d{1,2}) (\w{3}) (\d{4}), (\d{1,2}):(\d{2})(am|pm)$/);
  if (!m) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let hour = parseInt(m[4], 10) % 12;
  if (m[6] === "pm") hour += 12;
  const mm = String(months.indexOf(m[2]) + 1).padStart(2, "0");
  return `${m[3]}-${mm}-${m[1].padStart(2, "0")}T${String(hour).padStart(2, "0")}:${m[5]}:00+10:00`;
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
          logo_url: c.logo ? "/fixtures/capital-transport-logo.png" : null,
          currency: c.currency,
        }),
      ),
  };
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
