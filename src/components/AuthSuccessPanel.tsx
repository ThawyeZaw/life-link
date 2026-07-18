"use client";

// AuthSuccessPanel — post-auth confirmation shown right after login completes
// Shared by AuthModal and the dedicated /login page.
// Thinzar Kyaw — Frontend Domain

import { CircleCheckBig, Loader2 } from "lucide-react";

interface AuthSuccessPanelProps {
  role: string;
  context: string;
  email: string;
}

export const AuthSuccessPanel = ({
  role,
  context,
  email,
}: AuthSuccessPanelProps) => (
  <div className="flex flex-col items-center py-8 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <CircleCheckBig className="h-8 w-8 text-green-600" />
    </div>
    <h2 className="mt-4 text-xl font-bold text-gray-900">Login Successful!</h2>
    <p className="mt-2 text-sm text-slate-600">Welcome back, {role}</p>
    <p className="mt-1 font-mono text-xs text-slate-400">{email}</p>
    <p className="mt-1 text-xs text-slate-400">{context}</p>
    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      Redirecting…
    </div>
  </div>
);
