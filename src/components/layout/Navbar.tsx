"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setLoggedIn(!!session?.user)
    );
    return () => sub.subscription.unsubscribe();
  }, [pathname]);

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2">
          <Image src="/logo.png" alt="LifeLink" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Life<span className="text-red-600">Link</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/map"
            className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors ${
              pathname === "/map" ? "bg-red-50 text-red-600" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </Link>

          {loggedIn === null ? null : loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors ${
                  pathname.startsWith("/dashboard")
                    ? "bg-red-50 text-red-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={signOut}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex min-h-11 items-center rounded-full bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
