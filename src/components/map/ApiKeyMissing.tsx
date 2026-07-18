"use client";

// src/components/map/ApiKeyMissing.tsx
// LifeLink — Shown when NEXT_PUBLIC_MAPBOX_TOKEN is not set
// Thinzar Kyaw — Frontend Domain

import { Key, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

export function ApiKeyMissing() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100">
        <Key className="h-10 w-10 text-amber-600" />
      </div>

      <h2 className="mt-6 text-xl font-bold text-vr-navy text-center">
        Mapbox Token Required
      </h2>
      <p className="mt-2 text-sm text-gray-500 text-center max-w-md leading-relaxed">
        To display the interactive map, add your Mapbox public access token to the project.
      </p>

      {/* Steps */}
      <div className="mt-8 w-full max-w-md space-y-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-400 mb-4">
            Setup Steps
          </p>

          <ol className="space-y-4">
            <StepItem
              num={1}
              title="Go to Mapbox.com"
              href="https://www.mapbox.com/"
            />
            <StepItem
              num={2}
              title="Click &quot;Start mapping for free&quot; and create an account"
            />
            <StepItem
              num={3}
              title="Go to your Account Dashboard"
              href="https://account.mapbox.com/"
            />
            <StepItem
              num={4}
              title="Copy your default public token (starts with pk.)"
            />
            <StepItem
              num={5}
              title={
                <>
                  Add this line to{" "}
                  <code className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-vr-teal">
                    .env.local
                  </code>
                </>
              }
            />
          </ol>

          {/* Copy snippet */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 p-3">
            <code className="flex-1 text-xs font-mono text-gray-700 break-all">
              NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              aria-label="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          The free tier includes 50,000 map loads/month — no credit card required.
          Restart the dev server after adding the token.
        </p>
      </div>
    </div>
  );
}

function StepItem({
  num,
  title,
  href,
}: {
  num: number;
  title: React.ReactNode;
  href?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D1933] text-[10px] font-bold text-white mt-0.5">
        {num}
      </span>
      <span className="text-sm text-gray-700 leading-relaxed">
        {title}
        {href && (
          <>
            {" "}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-vr-teal hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs">Open</span>
            </a>
          </>
        )}
      </span>
    </li>
  );
}
