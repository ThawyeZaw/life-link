"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BloodTypePicker } from "./BloodTypePicker";
import { TownshipSelect } from "./TownshipSelect";
import { LocationButton } from "./LocationButton";
import { useT } from "@/i18n";

const input =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none";

export const SignupForm = () => {
  const { t } = useT();
  const router = useRouter();
  const [accountType, setAccountType] = useState<"individual" | "organization">("individual");
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone: "",
    blood_type: "", township: "", org_name: "", org_type: "community",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, account_type: accountType, ...coords }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? t("signup.signupFailed"));
      setLoading(false);
      return;
    }
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
        {(["individual", "organization"] as const).map((type) => (
          <button
            key={type} type="button" onClick={() => setAccountType(type)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
              accountType === type ? "bg-white text-red-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {type === "individual" ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            {type === "individual" ? t("signup.individual") : t("signup.organization")}
          </button>
        ))}
      </div>

      {accountType === "organization" && (
        <>
          <input className={input} placeholder={t("signup.orgNamePlaceholder")} required
            value={form.org_name} onChange={(e) => set("org_name")(e.target.value)} />
          <select className={input} value={form.org_type} onChange={(e) => set("org_type")(e.target.value)}>
            <option value="community">{t("signup.orgTypeCommunity")}</option>
            <option value="ngo">{t("signup.orgTypeNgo")}</option>
            <option value="hospital">{t("signup.orgTypeHospital")}</option>
            <option value="blood_bank">{t("signup.orgTypeBloodBank")}</option>
            <option value="other">{t("signup.orgTypeOther")}</option>
          </select>
        </>
      )}

      <input className={input} required
        placeholder={accountType === "organization" ? t("signup.contactNamePlaceholder") : t("signup.fullNamePlaceholder")}
        value={form.full_name} onChange={(e) => set("full_name")(e.target.value)} />
      <input className={input} type="email" placeholder={t("signup.emailPlaceholder")} required
        value={form.email} onChange={(e) => set("email")(e.target.value)} />
      <input className={input} type="password" placeholder={t("signup.passwordPlaceholder")} required minLength={8}
        value={form.password} onChange={(e) => set("password")(e.target.value)} />
      <input className={input} type="tel" placeholder={t("signup.phonePlaceholder")}
        value={form.phone} onChange={(e) => set("phone")(e.target.value)} />

      {accountType === "individual" && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">{t("signup.bloodType")}</span>
          <BloodTypePicker value={form.blood_type} onChange={set("blood_type")} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">{t("signup.township")}</span>
        <TownshipSelect value={form.township} onChange={set("township")} />
      </div>

      {accountType === "individual" && (
        <LocationButton onLocation={(lat, lng) => setCoords({ lat, lng })} />
      )}

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading}
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("signup.createAccountButton")}
      </button>
    </form>
  );
};
