// ============================================================================
// LifeLink — Root Middleware (Supabase Auth Session Refresh)
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh the auth session cookie on every request
  // This keeps the user's session alive across page navigations
  await supabase.auth.getUser();

  return supabaseResponse;
}

// Match all routes except static files, favicon, and Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
