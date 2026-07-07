import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
  // This response clears auth cookies — make sure no cache layer keeps it.
  response.headers.set(
    "cache-control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  return response;
}
