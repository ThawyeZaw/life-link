"use client";

// useDemoLogin — shared demo-login flow (loading → success → redirect)
// Used by both AuthModal (public pages) and the dedicated /login page.
// Thinzar Kyaw — Frontend Domain
// ⚠️ CROSS-BOUNDARY: Sets the demo-session cookie defined in @/utils/session
// (backend domain, Thaw Ye Zaw) so the middleware can authorize requests.

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  setDemoSessionCookie,
  matchesRoute,
  HOSPITAL_ONLY_ROUTES,
  ONBOARDING_COMPLETE_KEY,
  type DemoRole,
} from "@/utils/session";
import type { DemoProfile } from "@/components/DemoLoginCards";

export type AuthPhase =
  | { type: "idle" }
  | { type: "loading"; profileKey: string }
  | { type: "success"; role: string; context: string; email: string };

/** Pick the post-login destination based on role, onboarding state and ?next= */
const resolveDestination = (role: DemoRole, next: string | null): string => {
  // First-time donors complete onboarding before anything else
  if (role === "donor" && !window.localStorage.getItem(ONBOARDING_COMPLETE_KEY)) {
    return "/onboarding";
  }
  // Only allow safe, internal, role-permitted return paths
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    if (role === "donor" && matchesRoute(next, HOSPITAL_ONLY_ROUTES)) {
      return "/dashboard";
    }
    return next;
  }
  return "/dashboard";
};

export const useDemoLogin = (
  nextPath: string | null = null,
  onBeforeNavigate?: () => void
) => {
  const router = useRouter();
  const [phase, setPhase] = useState<AuthPhase>({ type: "idle" });

  const reset = useCallback(() => setPhase({ type: "idle" }), []);

  const login = useCallback(
    (profile: DemoProfile) => {
      setPhase((current) => {
        if (current.type !== "idle") return current;
        return { type: "loading", profileKey: profile.key };
      });

      // Cookie (not sessionStorage) so the middleware can see the session
      setDemoSessionCookie(profile.key);

      setTimeout(() => {
        // Success confirmation shown briefly before navigating
        setPhase({
          type: "success",
          role: profile.role,
          context: profile.context,
          email: profile.email,
        });
        setTimeout(() => {
          onBeforeNavigate?.();
          router.push(resolveDestination(profile.key, nextPath));
        }, 1500);
      }, 800);
    },
    [router, nextPath, onBeforeNavigate]
  );

  return { phase, login, reset };
};
