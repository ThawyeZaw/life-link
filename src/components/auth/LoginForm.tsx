"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, FlaskConical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
  { label: "Requester — Ma Thida", email: "thida@lifelink.demo" },
  { label: "Donor — U Kyaw Zin (O+)", email: "kyawzin@lifelink.demo" },
  { label: "Organization — Yangon Youth Blood Donors", email: "org@lifelink.demo" },
];

const DEMO_PASSWORD = "LifeLink123!";

export const LoginForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (em: string, pw: string) => {
    setError("");
    setLoading(true);
    const { error: err } = await createClient().auth.signInWithPassword({
      email: em,
      password: pw,
    });
    if (err) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    router.push(params.get("next") ?? "/dashboard");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn(email, password);
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
        />
        <input
          type="password" placeholder="Password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit" disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Log in
        </button>
      </form>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <FlaskConical className="h-3.5 w-3.5" /> Demo accounts (for judges)
        </p>
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email} disabled={loading}
              onClick={() => signIn(acc.email, DEMO_PASSWORD)}
              className="flex min-h-11 items-center justify-between rounded-xl bg-white px-4 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <span>{acc.label}</span>
              <span className="text-xs text-red-500">1-tap login →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
