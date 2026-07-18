"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ClipboardList,
  Droplets,
  LayoutDashboard,
  MapPin,
  Menu,
  Radio,
  Send,
  ShieldCheck,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { clsx } from "clsx";

interface HospitalTopBarProps {
  title: string;
  subtitle?: string;
  isLive?: boolean;
  hospitalName?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  className?: string;
}

const MENU_ITEMS = [
  {
    href: "/command",
    label: "Command Center",
    description: "Live emergency overview",
    icon: LayoutDashboard,
  },
  {
    href: "/broadcast",
    label: "Emergency Broadcast",
    description: "Create urgent blood requests",
    icon: Send,
  },
  {
    href: "/map",
    label: "Donation Map",
    description: "Interactive hospital & donor map",
    icon: MapPin,
  },
  {
    href: "/inventory",
    label: "Blood Inventory",
    description: "Manage available blood stock",
    icon: Droplets,
  },
  {
    href: "/requests",
    label: "Requests",
    description: "Review active requests",
    icon: ClipboardList,
  },
  {
    href: "/donors",
    label: "Donor Network",
    description: "View nearby verified donors",
    icon: Users,
  },
] as const;

export function HospitalTopBar({
  title,
  subtitle,
  isLive = true,
  hospitalName = "LifeLink Command Network",
  notificationCount = 0,
  onNotificationClick,
  className,
}: HospitalTopBarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleNotificationCount =
    notificationCount > 99 ? "99+" : notificationCount.toString();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <header
        className={clsx(
          "sticky top-0 z-40 overflow-hidden border-b border-white/10 bg-[#0D1933]",
          className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl"
        />

        <div className="relative mx-auto flex min-h-[88px] max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300 sm:flex">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-xl">
                  {title}
                </h1>

                <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-300 sm:inline-flex">
                  <ShieldCheck className="h-3 w-3 text-emerald-300" />
                  Secure
                </span>
              </div>

              <div className="mt-1.5 flex min-w-0 items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {isLive ? (
                    <>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                  )}
                </span>

                <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {subtitle ?? hospitalName}
                </p>

                <span
                  className={clsx(
                    "hidden items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase sm:inline-flex",
                    isLive
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-slate-500/10 text-slate-400",
                  )}
                >
                  {isLive ? (
                    <Radio className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}

                  {isLive ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onNotificationClick}
              aria-label="Open notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white"
            >
              <Bell className="h-5 w-5" />

              {notificationCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-black text-white">
                  {visibleNotificationCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open hospital menu"
              aria-expanded={menuOpen}
              aria-controls="hospital-mobile-menu"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/15"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={clsx(
          "fixed inset-0 z-[80] transition",
          menuOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible",
        )}
      >
        <button
          type="button"
          aria-label="Close hospital menu"
          onClick={() => setMenuOpen(false)}
          className={clsx(
            "absolute inset-0 bg-[#07101f]/65 backdrop-blur-sm transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <aside
          id="hospital-mobile-menu"
          aria-label="Hospital navigation"
          className={clsx(
            "absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-[#0D1933] shadow-[-30px_0_70px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="relative overflow-hidden border-b border-white/10 px-5 pb-6 pt-5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-white">LifeLink</p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Hospital Operations
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                  Emergency network active
                </p>
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-300">
                {subtitle ?? hospitalName}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {MENU_ITEMS.map(({ href, label, description, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/command" && pathname.startsWith(href));

              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "group flex items-center gap-3 rounded-2xl border px-3.5 py-3.5 transition",
                    isActive
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : "border-transparent hover:border-white/10 hover:bg-white/[0.06]",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition",
                      isActive
                        ? "bg-emerald-400 text-[#0D1933]"
                        : "bg-white/10 text-slate-300 group-hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={clsx(
                        "block text-sm font-black",
                        isActive ? "text-white" : "text-slate-200",
                      )}
                    >
                      {label}
                    </span>

                    <span className="mt-0.5 block truncate text-[10px] font-medium text-slate-500">
                      {description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl bg-white/[0.05] px-4 py-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                Emergency Blood Network Myanmar
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
