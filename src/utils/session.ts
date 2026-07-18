// ============================================================================
// Vertex Red — Session helpers (demo-session cookie + protected route map)
// Thaw Ye Zaw — Backend / Database Domain
// ⚠️ CROSS-BOUNDARY: This file lives in the backend domain (/utils/) but is
// imported by frontend components (AuthModal, DashboardGuard, Navbar) and the
// root middleware. Review with both Thaw Ye Zaw and Thinzar Kyaw before merging.
//
// The demo session is stored in a cookie (not sessionStorage) so the server
// middleware can enforce access control on every request. Real Supabase Auth
// sessions (sb-* cookies) are also honored by the middleware.
// ============================================================================

export const DEMO_SESSION_COOKIE = "vr-demo-session";
export const ONBOARDING_COMPLETE_KEY = "vr-onboarding-complete";
export const ONBOARDING_DATA_KEY = "vr-onboarding-data";

export type DemoRole = "hospital" | "donor";

/** All routes that require an authenticated session */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/passport",
  "/broadcast",
  "/inventory",
  "/map",
  "/command",
  "/onboarding",
];

/** Routes restricted to the Hospital Admin role (donors are redirected away) */
export const HOSPITAL_ONLY_ROUTES = ["/broadcast", "/inventory", "/command"];

export const isDemoRole = (
  value: string | null | undefined
): value is DemoRole => value === "hospital" || value === "donor";

export const matchesRoute = (pathname: string, routes: string[]): boolean =>
  routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

// ----------------------------------------------------------------------------
// Browser-only cookie helpers (used by client components)
// ----------------------------------------------------------------------------

/** Set the demo session cookie (24h). Readable by the middleware server-side. */
export const setDemoSessionCookie = (role: DemoRole): void => {
  document.cookie = `${DEMO_SESSION_COOKIE}=${role}; path=/; max-age=86400; SameSite=Lax`;
};

/** Clear the demo session cookie (logout) */
export const clearDemoSessionCookie = (): void => {
  document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

/** Read the current demo role from the cookie (null when signed out) */
export const getDemoSessionRole = (): DemoRole | null => {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${DEMO_SESSION_COOKIE}=`));
  const value = entry?.split("=")[1];
  return isDemoRole(value) ? value : null;
};

/** True when a real Supabase Auth cookie is present in the browser */
export const hasSupabaseSessionCookie = (): boolean => {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith("sb-") && c.includes("auth-token"));
};
