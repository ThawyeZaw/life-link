"use client";

// AuthModal — auth dialog: Sign In / Sign Up tabs + 1-click Developer Demo Login
// Includes a post-auth success state that auto-displays after auth completes,
// confirming the login before navigating to the dashboard.
// Thinzar Kyaw — Frontend Domain
// NOTE: Demo login sets the vr-demo-session cookie (via useDemoLogin) so the
// middleware can authorize requests — real Supabase Auth is backend domain
// (Thaw Ye Zaw).

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AuthTabs } from "@/components/AuthTabs";
import { AuthSuccessPanel } from "@/components/AuthSuccessPanel";
import { DemoLoginCards, type DemoProfile } from "@/components/DemoLoginCards";
import { useDemoLogin } from "@/hooks/useDemoLogin";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const router = useRouter();
  const [prefill, setPrefill] = useState<{ email: string; password: string } | null>(null);
  const { phase, login, reset } = useDemoLogin(null, onClose);

  // Called by AuthTabs when real Supabase sign-in/sign-up succeeds
  const handleAuthSuccess = useCallback(() => {
    onClose();
    router.push("/dashboard");
  }, [router, onClose]);

  // Reset to idle every time the modal opens — prevents stale state
  // from persisting across open/close cycles.
  useEffect(() => {
    if (open) {
      reset();
      setPrefill(null);
    }
  }, [open, reset]);

  const closeAndReset = () => {
    reset();
    setPrefill(null);
    onClose();
  };

  const handleDemoLogin = (profile: DemoProfile) => {
    if (phase.type !== "idle") return;
    setPrefill({ email: profile.email, password: profile.password });
    login(profile);
  };

  if (!open) return null;

  // ── Auth phase: success ──────────────────────────────────
  // Renders immediately after loading completes, keeping the
  // modal visible with a confirmation before navigation.
  if (phase.type === "success") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-start sm:pt-16 sm:pb-8"
        onClick={closeAndReset}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Login successful"
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-8 shadow-xl sm:rounded-3xl"
        >
          <AuthSuccessPanel
            role={phase.role}
            context={phase.context}
            email={phase.email}
          />
        </div>
      </div>
    );
  }

  // ── Auth phase: idle / loading ────────────────────────────
  const loadingKey = phase.type === "loading" ? phase.profileKey : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-start sm:pt-16 sm:pb-8"
      onClick={closeAndReset}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in or sign up"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-vr-navy">Welcome to LifeLink</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <AuthTabs prefill={prefill} onSuccess={handleAuthSuccess} />

        <DemoLoginCards
          loadingKey={loadingKey}
          disabled={phase.type !== "idle"}
          onLogin={handleDemoLogin}
        />
      </div>
    </div>
  );
};
