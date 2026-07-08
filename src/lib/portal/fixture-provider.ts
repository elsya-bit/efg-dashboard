import { monthName, parseAuTimestamp } from "@/lib/format";
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
