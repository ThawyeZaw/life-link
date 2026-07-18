"use client";

// src/components/layout/HospitalTopBar.tsx
// LifeLink — Hospital navigation and operations drawer
// Team Vertex Red

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  Droplets,
  Hospital,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Radio,
  Send,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { clsx } from "clsx";

interface HospitalTopBarProps {
  title: string;
  subtitle?: string;
  isLive?: boolean;
}

interface NavigationItem {
  label: string;
  description: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const PRIMARY_NAVIGATION: NavigationItem[] = [
  {
    label: "Command Center",
    description: "Live emergency overview",
    href: "/command",
    icon: LayoutDashboard,
  },
  {
    label: "Emergency Broadcast",
    description: "Create urgent blood requests",
    href: "/broadcast",
    icon: Send,
  },

  {
    href: "/map",
    label: "Donation Map",
    description: "Interactive hospital & donor map",
    icon: MapPin,
  },
  {
    label: "Donor Network",
    description: "View verified nearby donors",
    href: "/donors",
    icon: Users,
  },
];

const SECONDARY_NAVIGATION: NavigationItem[] = [
  {
    label: "Hospital Profile",
    description: "Facility and account details",
    href: "/hospital/profile",
    icon: Building2,
  },
  {
    label: "Settings",
    description: "Notifications and preferences",
    href: "/hospital/settings",
    icon: Settings,
  },
];

export function HospitalTopBar({
  title,
  subtitle = "Hospital operations",
  isLive = false,
}: HospitalTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeItem = useMemo(
    () =>
      [...PRIMARY_NAVIGATION, ...SECONDARY_NAVIGATION].find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
      ),
    [pathname],
  );

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const navigateTo = (href: string) => {
    setIsMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open hospital navigation"
              aria-expanded={isMenuOpen}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#0D1933] shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.97]"
            >
              <Menu className="h-5 w-5 transition-transform group-hover:scale-105" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-black tracking-tight text-[#0D1933] sm:text-base">
                  {title}
                </h1>

                {isLive && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-emerald-700 sm:inline-flex">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                )}
              </div>

              <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400 sm:text-xs">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label="Open notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-[#0D1933]"
            >
              <Bell className="h-4.5 w-4.5" />

              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/hospital/profile")}
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pr-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 sm:flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D1933] text-emerald-300">
                <Hospital className="h-4 w-4" />
              </span>

              <span className="text-left">
                <span className="block text-[10px] font-black text-[#0D1933]">
                  YGH
                </span>

                <span className="block text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Verified
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-[#07101F]/65 backdrop-blur-[3px]"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Hospital navigation"
            className="absolute right-0 top-0 flex h-[100dvh] w-[min(88vw,380px)] flex-col overflow-hidden border-l border-white/10 bg-[#0B1931] text-white shadow-[-28px_0_80px_rgba(3,10,25,0.28)]"
          >
            <div className="relative shrink-0 overflow-hidden border-b border-white/10 px-5 pb-5 pt-5">
              <div
                aria-hidden="true"
                className="absolute -right-14 -top-16 h-44 w-44 rounded-full bg-emerald-400/15 blur-3xl"
              />

              <div className="relative flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigateTo("/command")}
                  className="group flex min-w-0 items-center gap-3 text-left"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300 shadow-inner">
                    <Hospital className="h-5 w-5" />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-base font-black tracking-tight">
                      LifeLink
                    </span>

                    <span className="mt-0.5 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Hospital operations
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close hospital navigation"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mt-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08] p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-emerald-300">
                      Emergency network active
                    </p>

                    <p className="mt-1 truncate text-xs font-bold text-slate-200">
                      LifeLink Emergency Operations
                    </p>
                  </div>
                </div>

                <Activity className="h-4 w-4 shrink-0 text-emerald-300" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <NavigationGroup
                label="Operations"
                items={PRIMARY_NAVIGATION}
                pathname={pathname}
                onNavigate={navigateTo}
              />

              <NavigationGroup
                label="Account"
                items={SECONDARY_NAVIGATION}
                pathname={pathname}
                onNavigate={navigateTo}
                className="mt-6"
              />
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#08152A] p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Building2 className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-black text-white">
                    Yangon General Hospital
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />

                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-300">
                      Verified facility
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Sign out"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-center text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
                Emergency Blood Network Myanmar
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function NavigationGroup({
  label,
  items,
  pathname,
  onNavigate,
  className,
}: {
  label: string;
  items: NavigationItem[];
  pathname: string;
  onNavigate: (href: string) => void;
  className?: string;
}) {
  return (
    <section className={className}>
      <p className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
        {label}
      </p>

      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => onNavigate(item.href)}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                isActive
                  ? "border-emerald-400/25 bg-emerald-400/10 shadow-[0_10px_30px_rgba(16,185,129,0.08)]"
                  : "border-transparent hover:border-white/5 hover:bg-white/[0.05]",
              )}
            >
              <span
                className={clsx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition",
                  isActive
                    ? "bg-emerald-400 text-[#05291F] shadow-[0_8px_24px_rgba(52,211,153,0.25)]"
                    : "bg-white/10 text-slate-300 group-hover:bg-white/[0.14] group-hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={clsx(
                    "block truncate text-sm font-black",
                    isActive ? "text-white" : "text-slate-200",
                  )}
                >
                  {item.label}
                </span>

                <span
                  className={clsx(
                    "mt-0.5 block truncate text-[10px]",
                    isActive ? "text-emerald-100/60" : "text-slate-500",
                  )}
                >
                  {item.description}
                </span>
              </span>

              {item.badge && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-black text-white">
                  {item.badge}
                </span>
              )}

              <ChevronRight
                className={clsx(
                  "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                  isActive ? "text-emerald-300" : "text-slate-600",
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
