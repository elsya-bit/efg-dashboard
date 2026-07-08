"use server";

import { createClient } from "@/lib/supabase/server";
import { fixturesEnabled } from "@/lib/portal/fixtures-flag";

export type IngestResult =
  | { ok: true; message: string; monthKey: string }
  | { ok: false; error: string };

/**
 * Ingest a report export for a client. In production this forwards the
 * caller's JWT to the ingest-report Edge Function (which re-verifies the
 * internal role and applies everything with the service role). In dev
 * fixture mode it runs the same pure core against the in-memory store.
 */
export async function ingestReport(
  clientId: string,
  clientSlug: string,
  fileName: string,
  rawText: string,
): Promise<IngestResult> {
  if (rawText.length > 4_000_000) {
    return { ok: false, error: "File too large (4 MB limit)." };
  }

  if (fixturesEnabled()) {
    const { fixtureIngest } = await import("@/lib/portal/fixture-provider");
    return fixtureIngest(clientSlug, fileName, rawText);
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "Sign in required." };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-report`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          file_name: fileName,
          raw_text: rawText,
        }),
      },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body.error ?? `Ingestion failed (${res.status}).` };
    }
    return { ok: true, message: body.message, monthKey: body.monthKey };
  } catch (e) {
    return {
      ok: false,
      error: `Could not reach the ingestion service: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
