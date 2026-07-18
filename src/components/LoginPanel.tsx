"use client";

// LoginPanel — content of the dedicated /login page.
// Reads ?next= (set by the middleware redirect) to return the user to the
// page they originally requested after signing in.
// Thinzar Kyaw — Frontend Domain

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { AuthTabs } from "@/components/AuthTabs";
import { AuthSuccessPanel } from "@/components/AuthSuccessPanel";
import { DemoLoginCards, type DemoProfile } from "@/components/DemoLoginCards";
import { useDemoLogin } from "@/hooks/useDemoLogin";

export const LoginPanel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  // Only accept safe internal paths — prevents open-redirect abuse
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : null;

  const [prefill, setPrefill] = useState<{ email: string; password: string } | null>(null);
  const { phase, login } = useDemoLogin(next);

  // Called by AuthTabs when real Supabase sign-in/sign-up succeeds
  const handleAuthSuccess = useCallback(() => {
    router.push(next ?? "/dashboard");
  }, [router, next]);

  if (phase.type === "success") {
    return (
      <AuthSuccessPanel
        role={phase.role}
        context={phase.context}
        email={phase.email}
      />
    );
  }

  const handleDemoLogin = (profile: DemoProfile) => {
    if (phase.type !== "idle") return;
    setPrefill({ email: profile.email, password: profile.password });
    login(profile);
  };

  return (
    <>
      <div className="mb-5">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="mt-2 text-2xl font-black text-vr-navy">
          Sign in to LifeLink
        </h1>
        {next && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            You must be signed in to access that page. Log in to continue.
          </p>
        )}
      </div>

      <AuthTabs prefill={prefill} onSuccess={handleAuthSuccess} />

      <DemoLoginCards
        loadingKey={phase.type === "loading" ? phase.profileKey : null}
        disabled={phase.type !== "idle"}
        onLogin={handleDemoLogin}
      />
    </>
  );
};
