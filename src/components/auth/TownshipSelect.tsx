"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/i18n";

export const TownshipSelect = ({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => {
  const { t } = useT();
  const [townships, setTownships] = useState<{ name: string }[]>([]);

  useEffect(() => {
    createClient()
      .from("townships")
      .select("name")
      .order("name")
      .then(({ data }) => setTownships(data ?? []));
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 focus:border-red-500 focus:outline-none"
    >
      <option value="">{t("signup.townshipSelect")}</option>
      {townships.map((twp) => (
        <option key={twp.name} value={twp.name}>
          {twp.name}
        </option>
      ))}
    </select>
  );
};
