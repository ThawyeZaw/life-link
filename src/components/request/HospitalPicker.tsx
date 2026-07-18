"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Hospital } from "@/lib/types";

export const HospitalPicker = ({
  selected,
  onSelect,
}: {
  selected: Hospital | null;
  onSelect: (h: Hospital | null) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hospital[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      const { data } = await createClient()
        .from("hospitals")
        .select("id, name, name_mya, township, address, phone, lat, lng")
        .or(`name.ilike.%${query}%,township.ilike.%${query}%`)
        .limit(8);
      setResults((data as Hospital[]) ?? []);
    }, 250);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-base font-semibold text-slate-900">{selected.name}</p>
            <p className="text-sm text-slate-500">
              {selected.township ?? ""}{selected.address ? ` · ${selected.address}` : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
          aria-label="Change hospital"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hospital by name or township…"
          className="min-h-11 w-full bg-transparent text-base placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      {results.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
          {results.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => { onSelect(h); setQuery(""); setResults([]); }}
                className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-red-50"
              >
                <span className="text-base font-medium text-slate-900">{h.name}</span>
                <span className="text-sm text-slate-500">{h.township}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
