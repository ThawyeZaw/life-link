// HospitalTopBar — glass header for hospital/admin-facing screens
// Thinzar Kyaw — Frontend Domain

import { Menu } from "lucide-react";

interface HospitalTopBarProps {
  title: string;
  subtitle?: string;
  isLive?: boolean;
}

export const HospitalTopBar = ({
  title,
  subtitle,
  isLive = true,
}: HospitalTopBarProps) => {
  return (
    <header className="glass-elevated flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <div className="flex items-center gap-2 mt-1">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            )}
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
              {subtitle}
            </p>
          </div>
        )}
      </div>
      <button
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
};
