// DonorTopBar — glass header for donor-facing screens
// Thinzar Kyaw — Frontend Domain

import Link from "next/link";
import { Bell } from "lucide-react";

interface DonorTopBarProps {
  title: string;
  subtitle?: string;
}

export const DonorTopBar = ({ title, subtitle }: DonorTopBarProps) => {
  return (
    <header className="glass-surface flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <Link
        href="/passport"
        aria-label="Notifications"
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Bell className="h-5 w-5" />
      </Link>
    </header>
  );
};
