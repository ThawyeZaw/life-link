"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const TownshipSelect = ({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) => {
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
      <option value="">Select township…</option>
      {townships.map((t) => (
        <option key={t.name} value={t.name}>
          {t.name}
        </option>
      ))}
    </select>
  );
};
