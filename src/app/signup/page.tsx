"use client";

// ============================================================================
// LifeLink — Signup Page (User / Organisation accounts)
// ============================================================================

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Droplets,
  Heart,
  Loader2,
  MailCheck,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { BloodType, OrgType, Township } from "@/utils/supabase/types";

const BLOOD_TYPES: BloodType[] = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: "hospital", label: "Hospital" },
  { value: "ngo", label: "NGO" },
  { value: "blood_bank", label: "Blood bank" },
  { value: "community", label: "Community group" },
  { value: "other", label: "Other" },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [accountType, setAccountType] = useState<"user" | "organisation">("user");
  const [townships, setTownships] = useState<Township[]>([]);

  // Shared fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [township, setTownship] = useState("");
  const [bloodType, setBloodType] = useState<BloodType | "">("");

  // Organisation fields
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("hospital");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("townships")
      .select("id, name, region, lat, lng")
      .order("region")
      .order("name")
      .then(({ data }) => setTownships((data as Township[]) || []));
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (accountType === "organisation" && orgName.trim().length < 2) {
      setError("Please enter your organisation name.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          blood_type: bloodType || null,
          township: township || null,
          account_type: accountType,
          // Stored so the org can be created after email confirmation too
          pending_org_name: accountType === "organisation" ? orgName.trim() : null,
          pending_org_type: accountType === "organisation" ? orgType : null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, a session exists now
    if (data.session) {
      if (accountType === "organisation") {
        const { error: orgError } = await supabase.rpc("create_organization", {
          p_name: orgName.trim(),
          p_org_type: orgType,
          p_township: township || null,
          p_phone: phone || null,
        });
        if (orgError) {
          console.error("[signup] create_organization failed:", orgError.message);
        }
      }
      router.push(accountType === "organisation" ? "/org" : redirectTo);
      router.refresh();
      return;
    }

    setEmailSent(true);
    setLoading(false);
  };

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101B35] px-5">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100">
            <MailCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-5 text-xl font-black text-[#101B35]">Check your email</h1>
          <p className="mt-2 text-sm text-slate-500">
            We sent a confirmation link to <strong>{email}</strong>. Confirm it,
            then sign in to finish setting up your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-500 text-sm font-bold text-white transition hover:bg-red-400"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#101B35] outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101B35] px-5 py-10">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 shadow-[0_10px_35px_rgba(239,68,68,0.35)]">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <p className="text-2xl font-black tracking-tight text-white">
            Life<span className="text-red-400">Link</span>
          </p>
        </Link>

        <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-[#101B35]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join Myanmar&apos;s emergency blood network.
          </p>

          {/* Account type selector */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType("user")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                accountType === "user"
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Heart
                className={`h-6 w-6 ${accountType === "user" ? "text-emerald-600" : "text-slate-400"}`}
              />
              <span className="text-sm font-black text-[#101B35]">Personal</span>
              <span className="text-center text-[11px] leading-4 text-slate-500">
                Donate blood & request when in need
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("organisation")}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition ${
                accountType === "organisation"
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Building2
                className={`h-6 w-6 ${accountType === "organisation" ? "text-red-500" : "text-slate-400"}`}
              />
              <span className="text-sm font-black text-[#101B35]">Organisation</span>
              <span className="text-center text-[11px] leading-4 text-slate-500">
                Hospital, NGO, blood bank or community
              </span>
            </button>
          </div>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            {accountType === "organisation" && (
              <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50/50 p-4">
                <div>
                  <label htmlFor="orgName" className="text-xs font-bold text-slate-600">
                    Organisation name
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Yangon Blood Bank"
                  />
                </div>
                <div>
                  <label htmlFor="orgType" className="text-xs font-bold text-slate-600">
                    Organisation type
                  </label>
                  <select
                    id="orgType"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as OrgType)}
                    className={inputCls}
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="text-xs font-bold text-slate-600">
                {accountType === "organisation" ? "Contact person name" : "Full name"}
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
                placeholder="Your name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="text-xs font-bold text-slate-600">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-xs font-bold text-slate-600">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="text-xs font-bold text-slate-600">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="09..."
                />
              </div>
              <div>
                <label htmlFor="township" className="text-xs font-bold text-slate-600">
                  Township
                </label>
                <select
                  id="township"
                  required
                  value={township}
                  onChange={(e) => setTownship(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select township</option>
                  {townships.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {accountType === "user" && (
              <div>
                <label className="text-xs font-bold text-slate-600">Blood type</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setBloodType(bt)}
                      className={`rounded-xl border-2 py-2.5 text-sm font-black transition ${
                        bloodType === bt
                          ? "border-red-400 bg-red-500 text-white"
                          : "border-slate-200 text-[#101B35] hover:border-red-200"
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Only your township is used for matching — your exact location is
                  never stored.
                </p>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create {accountType === "organisation" ? "organisation" : ""} account
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-bold text-red-500 hover:text-red-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
