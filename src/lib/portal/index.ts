import { cache } from "react";
import { cookies } from "next/headers";
import { fixtureMonths, fixtureSession } from "./fixture-provider";
import { loadMonths, loadSession, type ProviderSession } from "./supabase-provider";
import { resolveEffectiveMonth, visibleMonths } from "./resolve";
import type { PortalRole, PortalShell } from "./types";

export const VIEW_AS_COOKIE = "efg-view";

/**
 * Dev-only fixture mode (design-handoff dataset, auth bypassed) so the UI
 * can be built and screenshot-verified without a reachable Supabase.
 * Refuses to activate in production builds.
 */
export function fixturesEnabled(): boolean {
  return (
    process.env.EFG_DEV_FIXTURES === "1" && process.env.NODE_ENV !== "production"
  );
}

async function getSession(): Promise<ProviderSession | null> {
  return fixturesEnabled() ? fixtureSession() : loadSession();
}

async function getMonths(clientId: string, clientSlug: string) {
  return fixturesEnabled() ? fixtureMonths(clientSlug) : loadMonths(clientId);
}

export type ShellResult =
  | { kind: "shell"; shell: PortalShell }
  | { kind: "redirect"; to: string }
  | { kind: "no-reports"; reason: string };

/**
 * Resolves everything the app shell needs for /[clientSlug]/[month]/…
 * Applies role gating, the view-as-client toggle, and the prototype's
 * effective-month fallback rules.
 */
export const getPortalShell = cache(async function getPortalShell(
  clientSlug: string,
  monthKey: string,
): Promise<ShellResult> {
  const session = await getSession();
  if (!session) return { kind: "redirect", to: "/login" };

  const { realRole, clients } = session;
  if (clients.length === 0) {
    return { kind: "redirect", to: realRole === "internal" ? "/admin" : "/no-access" };
  }

  const viewAsClient =
    realRole === "internal" &&
    (await cookies()).get(VIEW_AS_COOKIE)?.value === "client";
  const effectiveRole = viewAsClient ? "client" : realRole;

  const client = clients.find((c) => c.slug === clientSlug);
  if (!client) {
    return { kind: "redirect", to: `/${clients[0].slug}` };
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
    };
  }
  if (month.key !== monthKey) {
    return { kind: "redirect", to: `/${client.slug}/${month.key}/overview` };
  }

  return {
    kind: "shell",
    shell: {
      userEmail: session.userEmail,
      realRole,
      effectiveRole,
      viewAsClient,
      clients,
      client,
      months: visibleMonths(allMonths, effectiveRole),
      month,
    },
  };
});

/** Lightweight role probe for pages outside the portal shell (e.g. /admin). */
export async function getSessionRole(): Promise<PortalRole | null> {
  const session = await getSession();
  return session?.realRole ?? null;
}

/** Landing resolution for '/' and '/[clientSlug]': where should this login go? */
export async function getDefaultRoute(clientSlug?: string): Promise<string> {
  const session = await getSession();
  if (!session) return "/login";
  const { realRole, clients } = session;
  if (clients.length === 0) return realRole === "internal" ? "/admin" : "/no-access";

  const viewAsClient =
    realRole === "internal" &&
    (await cookies()).get(VIEW_AS_COOKIE)?.value === "client";
  const effectiveRole = viewAsClient ? "client" : realRole;

  const client = clients.find((c) => c.slug === clientSlug) ?? clients[0];
  const months = await getMonths(client.id, client.slug);
  const month = resolveEffectiveMonth(months, effectiveRole, null);
  if (!month) return `/${client.slug}/none/overview`;
  return `/${client.slug}/${month.key}/overview`;
}
