"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Loader2, MessageCircle, Unlink2 } from "lucide-react";
import { useT } from "@/i18n";
import { createClient } from "@/lib/supabase/client";

interface Props {
  telegramChatId: number | null;
}

export const TelegramConnect = ({ telegramChatId }: Props) => {
  const { t } = useT();
  const [chatIdInput, setChatIdInput] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState<number | null>(telegramChatId ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    setConnected(telegramChatId ?? null);
  }, [telegramChatId]);

  const handleConnect = async () => {
    const id = Number(chatIdInput.trim());
    if (!id || id <= 0) {
      setError("Please enter a valid Telegram chat ID.");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/profile/connect-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramChatId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("telegram.failedConnect"));
      setConnected(id);
      setChatIdInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/profile/connect-telegram", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      setConnected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disconnect");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-[0_10px_24px_rgba(14,165,233,0.22)]">
          <MessageCircle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-500 sm:text-xs">
            Telegram alerts
          </p>
          <h2 className="mt-1.5 text-lg font-black tracking-[-0.025em] text-slate-950 sm:text-xl">
            Get instant notifications
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Connect your Telegram account to receive blood donation alerts
            instantly — no email delays.
          </p>
        </div>
      </div>

      {connected ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-emerald-800">Connected</p>
              <p className="text-xs text-emerald-600">
                Telegram chat ID: {connected}
              </p>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={connecting}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink2 className="h-4 w-4" />
            )}
            Disconnect Telegram
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
            <p className="text-xs font-semibold text-sky-800">How to connect</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-sky-700">
              <li>
                Message{" "}
                <a
                  href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "LifeLinkBot"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline"
                >
                  @
                  {process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ??
                    "LifeLinkBot"}
                </a>{" "}
                on Telegram and send <code className="rounded bg-sky-100 px-1 font-mono text-sky-900">/start</code>
              </li>
              <li>Copy your chat ID from the bot&#39;s reply</li>
              <li>Paste it below and tap Connect</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Paste your Telegram chat ID"
              value={chatIdInput}
              onChange={(e) => {
                setChatIdInput(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              className="min-h-11 flex-1 rounded-full border border-slate-200 px-5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
            />
            <button
              onClick={handleConnect}
              disabled={connecting || !chatIdInput.trim()}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Connect
            </button>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
