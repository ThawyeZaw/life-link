// /login — dedicated login page. Unauthenticated users hitting any protected
// route are redirected here by the middleware (with ?next= for post-login
// return). Already-authenticated users are bounced to /dashboard.
// Thinzar Kyaw — Frontend Domain

import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { LoginPanel } from "@/components/LoginPanel";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to LifeLink to access the emergency blood network.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-10 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          }
        >
          <LoginPanel />
        </Suspense>
      </div>
    </main>
  );
}
