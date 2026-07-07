import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type MembershipRole = "internal" | "client";

export type Membership = {
  role: MembershipRole;
  client_id: string | null;
};

export type ClientRow = {
  id: string;
  slug: string;
  name: string;
  accent_colour: string | null;
};

export type UserContext = {
  user: User;
  isInternal: boolean;
  memberships: Membership[];
  clients: ClientRow[];
};

/**
 * Resolves the signed-in user plus their memberships and the clients their
 * login can read (as constrained by RLS). Returns null when signed out.
 */
export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [membershipsRes, clientsRes] = await Promise.all([
    supabase
      .from("memberships")
      .select("role, client_id")
      .eq("user_id", user.id),
    supabase
      .from("clients")
      .select("id, slug, name, accent_colour")
      .order("name"),
  ]);

  // A failed query must surface as an error, not as "no access" — otherwise a
  // transient API blip would bounce an authorised user to /no-access.
  if (membershipsRes.error) {
    throw new Error(`Failed to load memberships: ${membershipsRes.error.message}`);
  }
  if (clientsRes.error) {
    throw new Error(`Failed to load clients: ${clientsRes.error.message}`);
  }

  const memberships: Membership[] = membershipsRes.data;
  const clients: ClientRow[] = clientsRes.data;
  const isInternal = memberships.some((m) => m.role === "internal");

  return { user, isInternal, memberships, clients };
}
