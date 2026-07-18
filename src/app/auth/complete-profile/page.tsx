"use client";

// ============================================================================
// LifeLink — Complete Profile (first-time Google OAuth users)
// Collects account type, blood type, and township before protected actions.
// ============================================================================

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Droplets, Heart, Loader2 } from "lucide-react";
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

function CompleteProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [townships, setTownships] = useState<Township[]>([]);
  const [accountType, setAccountType] = useState<"user" | "organisation">("user");
  const [bloodType, setBloodType] = useState<BloodType | "">("");
  const [township, setTownship] = useState("");
  const [phone, setPhone] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<OrgType>("hospital");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("townships")
      .select("id, name, region, lat, lng")
      .order("region")
      .order("name")
      .then(({ data }) => setTownships((data as Township[]) || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (accountType === "user" && !bloodType) {
      setError("Please select your blood type.");
      return;
    }
    if (accountType === "organisation" && orgName.trim().length < 2) {
      setError("Please enter your organisation name.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        blood_type: bloodType || null,
        township: township || null,
        phone: phone || null,
        account_type: accountType,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    if (accountType === "organisation") {
      const { error: orgError } = await supabase.rpc("create_organization", {
        p_name: orgName.trim(),
        p_org_type: orgType,
        p_township: township || null,
        p_phone: phone || null,
      });
      if (orgError && orgError.message !== "INVALID_NAME") {
        console.error("[complete-profile] create_organization:", orgError.message);
      }
      router.push("/org");
      router.refresh();
      return;
    }

    router.push(next);
    router.refresh();
  };

  const inputCls =
    "mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#101B35] outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101B35] px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 shadow-[0_10px_35px_rgba(239,68,68,0.35)]">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <p className="text-2xl font-black tracking-tight text-white">
            Life<span className="text-red-400">Link</span>
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-[#101B35]">
            Complete your profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A few more details so matching can work for you.
          </p>

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
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense>
      <CompleteProfileForm />
    </Suspense>
  );
}
