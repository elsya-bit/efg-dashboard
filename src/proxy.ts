import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { fixturesEnabled } from "@/lib/portal/fixtures-flag";

/**
 * Request-time guard (Next 16 `proxy` convention — the renamed, non-deprecated
 * successor to `middleware`). Refreshes Supabase auth cookies on every request
 * and gates unauthenticated access.
 */
export async function proxy(request: NextRequest) {
  // Dev-only fixture mode renders the UI from the design-handoff dataset
  // without Supabase; auth is bypassed. Same guard as the data layer
  // (single source in fixtures-flag.ts), active only under `next dev`.
  if (fixturesEnabled()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // Responses that set auth cookies must never be cached by a CDN or
          // reverse proxy — one user's session could be served to another.
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run other logic between createServerClient and
  // auth.getUser() — it refreshes the session cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login" || pathname.startsWith("/login/");
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");

  // Redirects must carry any refreshed auth cookies and the matching
  // cache-suppression headers from the response Supabase populated.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = supabaseResponse.headers.get(header);
      if (value) redirectResponse.headers.set(header, value);
    }
    return redirectResponse;
  };

  if (!user && !isLoginRoute && !isAuthRoute) {
    return redirectTo("/login");
  }

  if (user && isLoginRoute) {
    return redirectTo("/");
  }

  // Return the supabaseResponse object as-is so refreshed cookies stay in
  // sync between the browser and the server.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation files)
     * - favicon.ico
     * - any path containing a file extension
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
  ],
};
