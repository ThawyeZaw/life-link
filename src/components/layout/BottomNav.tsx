"use client";

// src/components/navigation/BottomNav.tsx
// LifeLink — Mobile donor navigation
// Team Vertex Red

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  HeartPulse,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { clsx } from "clsx";

const TABS = [
  {
    href: "/passport",
    pathname: "/passport",
    hash: "",
    label: "Passport",
    icon: UserRound,
  },
  {
    href: "/map",
    pathname: "/map",
    hash: "",
    label: "Find Center",
    icon: MapPin,
  },
  {
    href: "/passport#health",
    pathname: "/passport",
    hash: "#health",
    label: "Health",
    icon: Activity,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash);
    };

    updateHash();

    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  return (
    <>
      <div aria-hidden="true" className="h-24 md:hidden" />

      <nav
        aria-label="Donor navigation"
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="mx-auto max-w-md overflow-hidden rounded-[1.7rem] border border-white/70 bg-white/90 p-2 shadow-[0_-8px_45px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <div className="grid grid-cols-3 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;

              const isActive =
                pathname === tab.pathname &&
                (tab.hash
                  ? currentHash === tab.hash
                  : currentHash !== "#health");

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  id={`nav-${tab.label.toLowerCase().replace(/\s+/g, "-")}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (tab.hash) {
                      setCurrentHash(tab.hash);
                    } else {
                      setCurrentHash("");
                    }
                  }}
                  className={clsx(
                    "group relative flex min-h-[64px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[1.2rem] px-2 text-center transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100",
                    isActive
                      ? "bg-[#0D1933] text-white shadow-[0_10px_28px_rgba(13,25,51,0.2)]"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                  )}
                >
                  {isActive && (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"
                      />

                      <span
                        aria-hidden="true"
                        className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-emerald-400/20 blur-2xl"
                      />
                    </>
                  )}

                  <div className="relative">
                    <span
                      className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-white/10 text-emerald-300"
                          : "bg-transparent group-hover:bg-white group-hover:shadow-sm",
                      )}
                    >
                      <Icon
                        className={clsx(
                          "h-5 w-5 transition-transform duration-300",
                          isActive
                            ? "-translate-y-0.5 scale-110"
                            : "group-hover:-translate-y-0.5",
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </span>

                    {tab.label === "Health" && (
                      <span
                        className={clsx(
                          "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2",
                          isActive
                            ? "border-[#0D1933] bg-emerald-400"
                            : "border-white bg-emerald-500",
                        )}
                      />
                    )}
                  </div>

                  <span
                    className={clsx(
                      "relative text-[10px] tracking-tight",
                      isActive
                        ? "font-black text-white"
                        : "font-bold text-slate-400 group-hover:text-slate-600",
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <ShieldCheck className="h-3 w-3 text-emerald-600" />

            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
              LifeLink donor network active
            </span>

            <HeartPulse className="h-3 w-3 text-red-500" />
          </div>
        </div>
      </nav>
    </>
  );
}
