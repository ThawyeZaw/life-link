// Live Map shell — protected route; wraps content in the client-side guard.
// Server-side gating is enforced by middleware (backend domain, Thaw Ye Zaw).
// Thinzar Kyaw — Frontend Domain

import { DashboardGuard } from "@/components/DashboardGuard";

export default function MapLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardGuard>{children}</DashboardGuard>;
}
