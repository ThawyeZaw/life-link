"use client";

import { useState } from "react";
import { LocateFixed, Check } from "lucide-react";
import { useT } from "@/i18n";

export const LocationButton = ({
  onLocation,
}: {
  onLocation: (lat: number, lng: number) => void;
}) => {
  const { t } = useT();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const locate = () => {
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocation(pos.coords.latitude, pos.coords.longitude);
        setState("done");
      },
      () => setState("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={locate}
        className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${
          state === "done"
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {state === "done" ? <Check className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />}
        {state === "loading"
          ? t("signup.locating")
          : state === "done"
            ? t("signup.locationSaved")
            : t("signup.shareLocation")}
      </button>
      <p className="mt-1.5 text-xs text-slate-500">
        {state === "error"
          ? t("signup.locationError")
          : t("signup.locationHint")}
      </p>
    </div>
  );
};
