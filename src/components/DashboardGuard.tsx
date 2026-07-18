"use client";

// DashboardGuard — client-side session gate for all protected app routes
// Thinzar Kyaw — Frontend Domain
// NOTE: Real auth gating is enforced server-side by the middleware (backend
// domain, Thaw Ye Zaw). This is a complementary client-side check for
// immediate UX feedback.
// ⚠️ CROSS-BOUNDARY: Reads the demo-session cookie helpers from
// @/utils/session (backend domain, Thaw Ye Zaw).

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  getDemoSessionRole,
  hasSupabaseSessionCookie,
} from "@/utils/session";

interface DashboardGuardProps {
  children: ReactNode;
}

export const DashboardGuard = ({ children }: DashboardGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hasSession =
      getDemoSessionRole() !== null || hasSupabaseSessionCookie();
    if (hasSession) {
      setAuthorized(true);
    } else {
      router.replace(
        `/login?next=${encodeURIComponent(pathname ?? "/dashboard")}`
      );
    }
    setChecked(true);
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!authorized) return null;
  return <>{children}</>;
};
