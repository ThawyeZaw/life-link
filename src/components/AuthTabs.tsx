"use client";

// AuthTabs — Sign In / Sign Up tabbed form UI
// Thinzar Kyaw — Frontend Domain
// ⚠️ CROSS-BOUNDARY: Calls Supabase Auth client defined in backend domain
// (Thaw Ye Zaw). onSuccess callback allows parent to redirect/close modal.

import { useEffect, useState, type FormEvent } from "react";
import { Mail, Lock, User, Phone, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PasswordPolicy } from "@/components/PasswordPolicy";

interface AuthTabsProps {
  prefill?: { email: string; password: string } | null;
  onSuccess?: () => void;
}

type AuthMode = "signin" | "signup";

const inputClasses =
  "w-full min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500";

const Field = ({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof Mail }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    <input className={inputClasses} {...props} />
  </div>
);

export const AuthTabs = ({ prefill = null, onSuccess }: AuthTabsProps) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (prefill) {
      setMode("signin");
      setEmail(prefill.email);
      setPassword(prefill.password);
    }
  }, [prefill]);

  // Clear error when switching tabs or editing fields
  const clearError = () => { if (error) setError(null); };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(mapAuthError(authError.message));
        return;
      }
      // Auth succeeded — Supabase sets sb-* cookies automatically.
      // Notify parent to redirect / close the modal.
      onSuccess?.();
    } catch (err) {
      setError("Unable to connect. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = e.currentTarget;
      const fullName = (form.elements.namedItem("fullName") as HTMLInputElement)?.value;
      const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value;
      const emailValue = (form.elements.namedItem("email") as HTMLInputElement)?.value;
      const passwordValue = (form.elements.namedItem("password") as HTMLInputElement)?.value;

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
          data: { full_name: fullName, phone },
        },
      });
      if (authError) {
        setError(mapAuthError(authError.message));
        return;
      }
      // Sign up succeeded — notify parent
      onSuccess?.();
    } catch (err) {
      setError("Unable to connect. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const mapAuthError = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid email")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (lower.includes("email not confirmed")) {
      return "Please verify your email address before signing in. Check your inbox for a confirmation link.";
    }
    if (lower.includes("too many requests") || lower.includes("rate limit")) {
      return "Too many sign-in attempts. Please wait a moment and try again.";
    }
    return message;
  };

  return (
    <div className="w-full">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-gray-100 p-1" role="tablist">
        {(
          [
            { key: "signin", label: "Sign In" },
            { key: "signup", label: "Sign Up" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={mode === tab.key}
            onClick={() => { setMode(tab.key); clearError(); }}
            className={clsx(
              "min-h-[44px] rounded-xl text-base font-semibold transition-all",
              mode === tab.key
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mode === "signin" ? (
        <form key="signin" onSubmit={handleSignIn} className="space-y-4">
          <Field
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
            required
          />
          <Field
            icon={Lock}
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-base font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      ) : (
        <form key="signup" onSubmit={handleSignUp} className="space-y-4">
          <Field icon={User} type="text" name="fullName" placeholder="Full name (e.g., Ko Aung)" required onChange={clearError} />
          <Field icon={Phone} type="tel" name="phone" placeholder="Phone (e.g., 09 7XX XXX XXX)" required onChange={clearError} />
          <Field icon={Mail} type="email" name="email" placeholder="Email address" required onChange={clearError} />
          <Field
            icon={Lock}
            type="password"
            name="password"
            placeholder="Create a password"
            value={signUpPassword}
            onChange={(e) => { setSignUpPassword(e.target.value); clearError(); }}
            required
          />
          <PasswordPolicy password={signUpPassword} />

          {/* MFA opt-in — frontend placeholder; enrollment handled by backend */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-left">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-red-600" />
            <div>
              <span className="flex items-center gap-1.5 text-sm font-bold text-vr-navy">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Enable Multi-Factor Authentication
              </span>
              <p className="mt-0.5 text-xs text-gray-500">
                Strongly recommended. You will be guided through setup after registration.
              </p>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-base font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
          <p className="text-center text-xs leading-relaxed text-gray-400">
            By joining, you agree to be contacted for emergency blood requests near you.
          </p>
        </form>
      )}
    </div>
  );
};
