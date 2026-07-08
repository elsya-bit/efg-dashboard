import { cache } from "react";
import { cookies } from "next/headers";
import {
  loadMonths,
  loadReport,
  loadSession,
  loadUploads,
  type ProviderSession,
} from "./supabase-provider";
import { fixturesEnabled } from "./fixtures-flag";
import { resolveEffectiveMonth, visibleMonths } from "./resolve";
import type { MonthReport } from "./report-types";
import type {
  PortalClient,
  PortalMonth,
  PortalRole,
  PortalShell,
  UploadRowDb,
} from "./types";

export const VIEW_AS_COOKIE = "efg-view";

/**
 * Month segment used when a client has nothing visible to show. The portal
 * layout resolves any unknown key to the no-reports state, so this is purely
 * a readable placeholder, never a real month.
 */
const NO_REPORTS_KEY = "none";

// The fixture provider (and the handoff dataset it imports) is loaded
// dynamically so production bundles never include it.
async function getSession(): Promise<ProviderSession | null> {
  if (fixturesEnabled()) {
    return (await import("./fixture-provider")).fixtureSession();
  }
  return loadSession();
}

async function getMonths(
  clientId: string,
  clientSlug: string,
): Promise<PortalMonth[]> {
  if (fixturesEnabled()) {
    return (await import("./fixture-provider")).fixtureMonths(clientSlug);
  }
  return loadMonths(clientId);
}

type Gate =
  | { kind: "redirect"; to: string }
  | {
      kind: "ok";
      session: ProviderSession;
      viewAsClient: boolean;
      effectiveRole: PortalRole;
    };

/** Shared gating prelude: session → sign-in / no-access, view-as cookie, role. */
async function resolveGate(): Promise<Gate> {
  const session = await getSession();
  if (!session) return { kind: "redirect", to: "/login" };
  if (session.clients.length === 0) {
    return {
      kind: "redirect",
      to: session.realRole === "internal" ? "/admin" : "/no-access",
    };
  }
  const viewAsClient =
    session.realRole === "internal" &&
    (await cookies()).get(VIEW_AS_COOKIE)?.value === "client";
  return {
    kind: "ok",
    session,
    viewAsClient,
    effectiveRole: viewAsClient ? "client" : session.realRole,
  };
}

export type ShellResult =
  | { kind: "shell"; shell: PortalShell }
  | { kind: "redirect"; to: string }
  | {
      kind: "no-reports";
      reason: string;
      realRole: PortalRole;
      viewAsClient: boolean;
    };

/**
 * Resolves everything the app shell needs for /[clientSlug]/[month]/…
 * Applies role gating, the view-as-client toggle, and the prototype's
 * effective-month fallback rules.
 */
export const getPortalShell = cache(async function getPortalShell(
  clientSlug: string,
  monthKey: string,
): Promise<ShellResult> {
  const gate = await resolveGate();
  if (gate.kind === "redirect") return gate;
  const { session, viewAsClient, effectiveRole } = gate;

  const client = session.clients.find((c) => c.slug === clientSlug);
  if (!client) {
    return { kind: "redirect", to: `/${session.clients[0].slug}` };
  }

  const allMonths = await getMonths(client.id, client.slug);
  const month = resolveEffectiveMonth(allMonths, effectiveRole, monthKey);
  if (!month) {
    return {
      kind: "no-reports",
      reason:
        effectiveRole === "client"
          ? "Your first report is being prepared."
          : "No reported months yet for this client.",
      realRole: session.realRole,
      viewAsClient,
    };
  }
  if (month.key !== monthKey) {
    return { kind: "redirect", to: `/${client.slug}/${month.key}/overview` };
  }

  return {
    kind: "shell",
    shell: {
      userEmail: session.userEmail,
      realRole: session.realRole,
      effectiveRole,
      viewAsClient,
      clients: session.clients,
      client,
      months: visibleMonths(allMonths, effectiveRole),
      month,
    },
  };
});

/**
 * Landing resolution for '/' and '/[clientSlug]': the preferred client if it
 * has something to show, otherwise the first client that does — so one
 * report-less client never blanks the whole portal.
 */
export async function getDefaultRoute(clientSlug?: string): Promise<string> {
  const gate = await resolveGate();
  if (gate.kind === "redirect") return gate.to;
  const { session, effectiveRole } = gate;

  const preferred = session.clients.find((c) => c.slug === clientSlug);
  const candidates = preferred
    ? [preferred, ...session.clients.filter((c) => c !== preferred)]
    : session.clients;

  for (const client of candidates) {
    const months = await getMonths(client.id, client.slug);
    const month = resolveEffectiveMonth(months, effectiveRole, null);
    if (month) return `/${client.slug}/${month.key}/overview`;
  }

  // Nothing visible anywhere: internal staff get the admin workspace, client
  // logins the (first) client's no-reports state.
  if (session.realRole === "internal" && !gate.viewAsClient) return "/admin";
  return `/${(preferred ?? session.clients[0]).slug}/${NO_REPORTS_KEY}/overview`;
}

/**
 * Shell + full month report for a screen render. The report is the months.report
 * jsonb; clients only ever reach Published months (RLS + effective-month rules).
 */
export const getScreenData = cache(async function getScreenData(
  clientSlug: string,
  monthKey: string,
): Promise<
  | { kind: "shell"; shell: PortalShell; report: MonthReport }
  | Exclude<ShellResult, { kind: "shell" }>
> {
  const result = await getPortalShell(clientSlug, monthKey);
  if (result.kind !== "shell") return result;
  const raw = fixturesEnabled()
    ? (await import("./fixture-provider")).fixtureReport(
        result.shell.client.slug,
        result.shell.month.key,
      )
    : await loadReport(result.shell.month.id);
  return {
    kind: "shell",
    shell: result.shell,
    report: (raw ?? {}) as MonthReport,
  };
});

export type UploadsView =
  | {
      kind: "view";
      client: PortalClient;
      clients: PortalClient[];
      uploads: UploadRowDb[];
    }
  | { kind: "redirect"; to: string };

/**
 * Uploads manager data — internal staff only (clients must never see the
 * upload pipeline; RLS enforces the same server-side).
 */
export async function getUploadsView(clientSlug: string): Promise<UploadsView> {
  const session = await getSession();
  if (!session) return { kind: "redirect", to: "/login" };
  if (session.realRole !== "internal") return { kind: "redirect", to: "/" };
  const client =
    session.clients.find((c) => c.slug === clientSlug) ?? session.clients[0];
  if (!client) return { kind: "redirect", to: "/admin" };
  const uploads = fixturesEnabled()
    ? (await import("./fixture-provider")).fixtureUploads(client.slug)
    : await loadUploads(client.id);
  return { kind: "view", client, clients: session.clients, uploads };
}

export type ClientMonths =
  | {
      kind: "months";
      client: PortalClient;
      /** Every month visible to the effective role, newest first (incl. Planned for internal). */
      months: PortalMonth[];
      effectiveRole: PortalRole;
      viewAsClient: boolean;
    }
  | { kind: "redirect"; to: string };

/**
 * Month list for screens that show more than reported months (Reports,
 * Budget history/upcoming). Clients only ever get Published months — both
 * here and at the RLS layer.
 */
export const getClientMonths = cache(async function getClientMonths(
  clientSlug: string,
): Promise<ClientMonths> {
  const gate = await resolveGate();
  if (gate.kind === "redirect") return gate;
  const { session, viewAsClient, effectiveRole } = gate;
  const client = session.clients.find((c) => c.slug === clientSlug);
  if (!client) return { kind: "redirect", to: `/${session.clients[0].slug}` };
  const all = await getMonths(client.id, client.slug);
  const months =
    effectiveRole === "client"
      ? all.filter((m) => m.status === "Published" && m.has_report)
      : all;
  return { kind: "months", client, months, effectiveRole, viewAsClient };
});

/** All clients, for internal-only admin surfaces. Null unless internal. */
export async function getInternalClients(): Promise<PortalClient[] | null> {
  const session = await getSession();
  if (!session || session.realRole !== "internal") return null;
  return session.clients;
}

export type PortalSession = {
  userEmail: string;
  realRole: PortalRole;
  clientCount: number;
};

/** Lightweight session summary for pages outside the shell (/admin, /no-access). */
export async function getPortalSession(): Promise<PortalSession | null> {
  const session = await getSession();
  if (!session) return null;
  return {
    userEmail: session.userEmail,
    realRole: session.realRole,
    clientCount: session.clients.length,
  };
}
