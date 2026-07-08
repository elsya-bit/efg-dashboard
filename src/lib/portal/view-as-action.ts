"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VIEW_AS_COOKIE } from "./index";

/** Internal-only preview: render the portal exactly as the client sees it. */
export async function setViewAsClient(
  on: boolean,
  clientSlug: string,
  monthKey: string,
) {
  const store = await cookies();
  if (on) {
    store.set(VIEW_AS_COOKIE, "client", { path: "/", sameSite: "lax" });
  } else {
    store.delete(VIEW_AS_COOKIE);
  }
  // Month visibility can change with the role (drafts hidden), so go through
  // the overview and let the effective-month rules re-resolve.
  redirect(`/${clientSlug}/${monthKey}/overview`);
}
