import { createClient } from "@/lib/supabase/server";
import { monthName, toMonthKey } from "@/lib/format";
import type { MonthStatus, PortalClient, PortalMonth, PortalRole } from "./types";

type ClientRowDb = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  industry: string | null;
  objective: string | null;
  manager: string | null;
  contact: string | null;
  contact_role: string | null;
  accent_colour: string | null;
  logo_path: string | null;
  currency: string;
};

function logoUrl(logo_path: string | null): string | null {
  if (!logo_path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/client-logos/${logo_path}`;
}

export type ProviderSession = {
  userEmail: string;
  realRole: PortalRole;
  clients: PortalClient[];
};

/** Signed-out → null. Signed in with no memberships → clients: []. */
export async function loadSession(): Promise<ProviderSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [membershipsRes, clientsRes] = await Promise.all([
    supabase.from("memberships").select("role, client_id").eq("user_id", user.id),
    supabase
      .from("clients")
      .select(
        "id, slug, name, initials, industry, objective, manager, contact, contact_role, accent_colour, logo_path, currency",
      )
      .order("name"),
  ]);
  if (membershipsRes.error) {
    throw new Error(`Failed to load memberships: ${membershipsRes.error.message}`);
  }
  if (clientsRes.error) {
    throw new Error(`Failed to load clients: ${clientsRes.error.message}`);
  }

  const realRole: PortalRole = (membershipsRes.data ?? []).some(
    (m) => m.role === "internal",
  )
    ? "internal"
    : "client";

  const clients = ((clientsRes.data ?? []) as ClientRowDb[]).map((c) => ({
    ...c,
    logo_url: logoUrl(c.logo_path),
  }));

  return { userEmail: user.email ?? "", realRole, clients };
}

/** Full report jsonb for one month row (RLS applies). */
export async function loadReport(monthId: string): Promise<unknown> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("months")
    .select("report")
    .eq("id", monthId)
    .single();
  if (error) {
    throw new Error(`Failed to load report: ${error.message}`);
  }
  return data?.report ?? null;
}

type MonthRowDb = {
  id: string;
  month: string;
  status: MonthStatus;
  budget: number | null;
  target_cpl: number | null;
  days_in_month: number | null;
  days_elapsed: number | null;
  updated_at: string | null;
  metrics: unknown;
};

/** All months for a client (RLS already hides non-published from clients), newest first. */
export async function loadMonths(clientId: string): Promise<PortalMonth[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("months")
    .select(
      "id, month, status, budget, target_cpl, days_in_month, days_elapsed, updated_at, metrics:report->metrics",
    )
    .eq("client_id", clientId)
    .order("month", { ascending: false });
  if (error) {
    throw new Error(`Failed to load months: ${error.message}`);
  }

  return ((data ?? []) as MonthRowDb[]).map((m) => {
    const key = toMonthKey(m.month);
    return {
      id: m.id,
      key,
      label: monthName(key),
      status: m.status,
      budget: m.budget,
      target_cpl: m.target_cpl,
      days_in_month: m.days_in_month,
      days_elapsed: m.days_elapsed,
      updated_at: m.updated_at,
      has_report: m.metrics != null,
    };
  });
}
