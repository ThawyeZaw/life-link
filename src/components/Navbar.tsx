"use client";

// Curved Floating Navigation Pill — site-wide bottom-positioned glassmorphism capsule
// Detects all app routes (dashboard, passport, broadcast, inventory, map, command)
// Public routes → nav links + "Login / Join" auth modal
// App routes → dashboard links + Logout (hospital-only links hidden for donors)
// No logo/heading — pure navigation pill
// Thinzar Kyaw — Frontend Domain
// ⚠️ CROSS-BOUNDARY: Uses demo-session cookie helpers from @/utils/session
// (backend domain, Thaw Ye Zaw).

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, UserCircle2, LogOut, LayoutDashboard } from "lucide-react";
import { clsx } from "clsx";
import { AuthModal } from "@/components/AuthModal";
import {
  clearDemoSessionCookie,
  getDemoSessionRole,
  matchesRoute,
  HOSPITAL_ONLY_ROUTES,
  type DemoRole,
} from "@/utils/session";

const PUBLIC_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
];

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Request Board" },
  { href: "/passport", label: "Donor Passport" },
  { href: "/broadcast", label: "Broadcast" },
  { href: "/inventory", label: "Inventory" },
  { href: "/map", label: "Live Map" },
];

const APP_ROUTES = ["/dashboard", "/passport", "/broadcast", "/inventory", "/map", "/command"];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isApp = APP_ROUTES.some((route) => pathname?.startsWith(route)) ?? false;

  const [role, setRole] = useState<DemoRole | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Re-read role on navigation (cookie is set/cleared on login/logout)
  useEffect(() => {
    setRole(getDemoSessionRole());
  }, [pathname]);

  // Donors don't see hospital-only links (Broadcast, Inventory, Command)
  const links = isApp
    ? DASHBOARD_LINKS.filter(
        (link) =>
          role !== "donor" || !matchesRoute(link.href, HOSPITAL_ONLY_ROUTES)
      )
    : PUBLIC_LINKS;

  // Hide pill on scroll down, show on scroll up (saves vertical space)
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    clearDemoSessionCookie();
    window.sessionStorage.removeItem("vr-demo-session");
    window.localStorage.removeItem("vr-demo-session");
    setRole(null);
    router.replace("/");
  };

  // The dedicated /login page renders its own UI — no floating pill there
  if (pathname === "/login") return null;

  return (
    <>
      {/* Curved floating pill */}
      <nav
        className={clsx(
          "fixed bottom-5 left-1/2 z-50 -translate-x-1/2 transition-all duration-400 ease-in-out",
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-24 opacity-0"
        )}
      >
        <div className="glass-overlay flex items-center gap-1 rounded-full px-3 py-2 shadow-2xl shadow-slate-900/10 sm:gap-2 sm:px-4 sm:py-2.5">
          {/* Desktop nav links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-white/70 text-red-600 shadow-sm"
                    : "text-slate-600 hover:bg-white/40 hover:text-gray-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Divider — visible when desktop links present */}
          <div className="mx-1 hidden h-6 w-px bg-slate-200 md:block" aria-hidden="true" />

          {/* Auth / Dashboard actions */}
          {isApp ? (
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:bg-white/50"
              >
                <LayoutDashboard className="h-4 w-4 text-red-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="group flex min-h-[44px] items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/20 transition-all duration-300 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95"
            >
              <UserCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
              Login / Join
            </button>
          )}

          {/* Mobile hamburger — opens menu upward */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-600 transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu — opens upward from the pill */}
        <div
          className={clsx(
            "absolute bottom-full left-0 right-0 mb-3 rounded-2xl border border-white/50 bg-white/92 p-3 shadow-xl backdrop-blur-2xl md:hidden",
            !menuOpen && "hidden"
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "flex min-h-[44px] items-center rounded-xl px-4 text-sm font-semibold transition",
                pathname === link.href
                  ? "bg-white/70 text-red-600"
                  : "text-slate-700 hover:bg-white/50 hover:text-red-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom spacer — prevents content from being hidden behind the floating pill */}
      <div className="h-24" aria-hidden="true" />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};
