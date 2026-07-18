// Inventory shell — protected route (hospital-only, enforced by middleware);
// wraps content in the client-side guard for immediate UX feedback.
// Thinzar Kyaw — Frontend Domain

import { DashboardGuard } from "@/components/DashboardGuard";

export default function InventoryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardGuard>{children}</DashboardGuard>;
}
