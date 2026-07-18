// Dashboard shell — protected area layout, sidebar removed (floating pill nav is primary)
// Thinzar Kyaw — Frontend Domain
// NOTE: Auth-gating (redirect if unauthenticated) is handled by middleware
// in the backend domain (Thaw Ye Zaw). This layout is UI only.

import { DashboardGuard } from "@/components/DashboardGuard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
        {/* Main content — gated by client-side guard */}
        <main className="min-w-0 flex-1">
          <DashboardGuard>{children}</DashboardGuard>
        </main>
      </div>
    </div>
  );
}
