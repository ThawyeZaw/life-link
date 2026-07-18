// ============================================================================
// Vertex Red — Root Middleware (Auth Enforcement + Supabase Session Refresh)
// Thaw Ye Zaw — Backend / Database Domain
//
// Access control (server-side, authoritative):
//   1. Unauthenticated users hitting any protected route → redirect /login?next=…
//   2. Demo donors hitting hospital-only routes → redirect /dashboard
//   3. Authenticated users hitting /login → redirect /dashboard (no login loop)
//
// A user is authenticated when EITHER:
//   • a real Supabase Auth session exists (sb-* cookies), OR
//   • the demo-session cookie holds a valid role ("hospital" | "donor")
//
// Performance: supabase.auth.getUser() (network call) only runs when sb-*
// cookies are actually present, so demo/anonymous traffic skips it entirely.
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/middleware";
import {
  DEMO_SESSION_COOKIE,
  PROTECTED_ROUTES,
  HOSPITAL_ONLY_ROUTES,
  isDemoRole,
  matchesRoute,
} from "@/utils/session";

// Route prefixes that require a logged-in user
const PROTECTED_PREFIXES = [
  "/broadcast",
  "/command",
  "/donors",
  "/profile",
  "/org",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Resolve demo session (cookie set by the frontend demo login) ---------
  const demoCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
  const demoRole = isDemoRole(demoCookie) ? demoCookie : null;

  // --- Resolve real Supabase session (only if auth cookies are present) -----
  let user: User | null = null;
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const hasSupabaseCookies = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  if (hasSupabaseCookies) {
    const client = createClient(request);
    supabaseResponse = client.supabaseResponse;
    try {
      // Also refreshes the session cookie, keeping real sessions alive
      const { data } = await client.supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null; // Placeholder/unreachable Supabase env — treat as signed out
    }
  }

  const isAuthenticated = Boolean(user) || demoRole !== null;

  // --- 1. Gate all protected routes -----------------------------------------
  if (matchesRoute(pathname, PROTECTED_ROUTES) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // --- 2. Role gate: demo donors cannot access hospital-only routes ---------
  if (
    matchesRoute(pathname, HOSPITAL_ONLY_ROUTES) &&
    !user &&
    demoRole === "donor"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // --- 3. Prevent login loops: already-authed users skip /login -------------
  if (pathname === "/login" && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Match all routes except static files, favicon, and Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
