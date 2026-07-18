"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Radio,
  UserPlus,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const signOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
      setMobileOpen(false);
    }
  };

  const mapActive = pathname === "/map";
  const dashboardActive = pathname.startsWith("/dashboard");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="LifeLink home"
          className="group flex min-h-11 min-w-0 items-center gap-2.5 rounded-2xl outline-none transition focus-visible:ring-4 focus-visible:ring-red-100"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-red-100 bg-red-50 shadow-[0_8px_24px_rgba(239,68,68,0.12)] transition duration-300 group-hover:scale-[1.03]">
            <Image
              src="/logo.png"
              alt="LifeLink"
              width={44}
              height={44}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-lg font-black tracking-[-0.035em] text-slate-950 sm:text-xl">
                Life<span className="text-red-600">Link</span>
              </span>

              <span className="relative hidden h-2 w-2 sm:flex">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            </div>

            <p className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:block">
              Emergency Blood Network
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <DesktopNavLink
              href="/map"
              active={mapActive}
              icon={<MapPin className="h-4 w-4" />}
            >
              Live map
            </DesktopNavLink>

            {loggedIn && (
              <DesktopNavLink
                href="/dashboard"
                active={dashboardActive}
                icon={<LayoutDashboard className="h-4 w-4" />}
              >
                Dashboard
              </DesktopNavLink>
            )}
          </div>

          {loggedIn === null ? (
            <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
              Checking
            </div>
          ) : loggedIn ? (
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}

              {signingOut ? "Signing out" : "Sign out"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <LogIn className="h-4 w-4" />
                Log in
              </Link>

              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(220,38,38,0.24)] transition hover:bg-red-700 active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" />
                Sign up
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <Link
            href="/map"
            aria-label="Open live map"
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
              mapActive
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MapPin className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:hidden">
          <div className="mx-auto max-w-7xl space-y-2">
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>

                <span className="truncate text-xs font-bold uppercase tracking-[0.12em] text-red-700">
                  LifeLink network active
                </span>
              </div>

              <Radio className="h-4 w-4 shrink-0 text-red-500" />
            </div>

            <MobileNavLink
              href="/map"
              active={mapActive}
              icon={<MapPin className="h-5 w-5" />}
              description="View emergency requests nearby"
            >
              Live map
            </MobileNavLink>

            {loggedIn && (
              <MobileNavLink
                href="/dashboard"
                active={dashboardActive}
                icon={<LayoutDashboard className="h-5 w-5" />}
                description="Manage requests and donor activity"
              >
                Dashboard
              </MobileNavLink>
            )}

            {loggedIn === null ? (
              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                Checking your account
              </div>
            ) : loggedIn ? (
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 text-left text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                  {signingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                </span>

                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <LogIn className="h-4 w-4" />
                  Log in
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)] transition hover:bg-red-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

type DesktopNavLinkProps = {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const DesktopNavLink = ({
  href,
  active,
  icon,
  children,
}: DesktopNavLinkProps) => {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-bold transition ${
        active
          ? "bg-white text-red-600 shadow-sm ring-1 ring-slate-200"
          : "text-slate-600 hover:bg-white hover:text-slate-950"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
};

type MobileNavLinkProps = DesktopNavLinkProps & {
  description: string;
};

const MobileNavLink = ({
  href,
  active,
  icon,
  children,
  description,
}: MobileNavLinkProps) => {
  return (
    <Link
      href={href}
      className={`flex min-h-16 items-center gap-3 rounded-2xl border px-3.5 transition ${
        active
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active ? "bg-white text-red-600" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-black">{children}</span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-400">
          {description}
        </span>
      </span>
    </Link>
  );
};
