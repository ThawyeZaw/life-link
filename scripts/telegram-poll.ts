/**
 * Local development Telegram bot — polls getUpdates to handle /start.
 *
 * Usage: npx tsx scripts/telegram-poll.ts   (or  npm run telegram-poll)
 *
 * REQUIRED env vars (in .env.local):
 *   TELEGRAM_BOT_TOKEN     — from @BotFather
 *   NEXT_PUBLIC_SITE_URL   — app URL (default: http://localhost:3000)
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (tsx doesn't do this — only Next.js does)
const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) continue;
  const key = line.slice(0, eqIdx).trim();
  if (!key || key.startsWith("#")) continue;
  const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN_DEV;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is not set. Add it to .env.local and try again.");
  process.exit(1);
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const API = `https://api.telegram.org/bot${TOKEN}`;

interface Update {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    from?: { first_name?: string };
  };
}

async function sendMessage(chatId: number, text: string, html = false) {
  try {
    const res = await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: html ? "HTML" : undefined }),
    });
    const json = await res.json();
    if (!json.ok) console.error("[sendMessage] failed:", json.description);
  } catch (e) {
    console.error("[sendMessage] network error:", e);
  }
}

async function poll() {
  // 1. Delete webhook if set (so getUpdates works), but do NOT drop pending updates
  try {
    const whRes = await fetch(`${API}/getWebhookInfo`);
    const wh = await whRes.json();
    if (wh.result?.url) {
      console.log("   Removing existing webhook:", wh.result.url);
      await fetch(`${API}/deleteWebhook`);
    }
  } catch {
    // ok — might already be gone
  }

  // 2. Find the latest update_id so we resume from here
  let lastUpdateId = 0;
  try {
    const r = await fetch(`${API}/getUpdates?limit=1&offset=-1`);
    const j = await r.json();
    if (j.result?.length) {
      lastUpdateId = j.result[j.result.length - 1].update_id;
    }
  } catch {
    // ok — start from 0
  }

  console.log(`🤖 LifeLink Telegram bot polling started`);
  console.log(`   Bot  : ${(await (await fetch(`${API}/getMe`)).json()).result?.username}`);
  console.log(`   Site : ${SITE_URL}`);
  console.log(`   Offset: ${lastUpdateId + 1}`);
  console.log(`   Send /start to the bot to test.\n`);

  while (true) {
    try {
      const res = await fetch(
        `${API}/getUpdates?offset=${lastUpdateId + 1}&timeout=25`
      );
      const json = await res.json();

      if (!json.ok) {
        console.error("[poll] getUpdates error:", json.description);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const updates = (json.result as Update[]) ?? [];
      if (updates.length === 0) {
        // Timeout reached — no new messages, just loop again
        continue;
      }

      for (const update of updates) {
        lastUpdateId = update.update_id;

        const msg = update.message;
        if (!msg?.text) continue;

        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name ?? "there";
        const text = msg.text.trim();

        console.log(`📩 [chat:${chatId}] ${firstName}: ${text}`);

        if (text === "/start") {
          await sendMessage(
            chatId,
            `👋 Hi ${firstName}! Welcome to the LifeLink blood donation network.\n\n` +
              `🔢 Your Telegram chat ID is: ${chatId}\n\n` +
              `To receive instant blood donation alerts:\n` +
              `1. Log in to LifeLink at ${SITE_URL}/dashboard\n` +
              `2. Find Telegram alerts on your dashboard\n` +
              `3. Enter your chat ID ${chatId} and tap Connect\n\n` +
              `Once connected, you'll receive urgent alerts here whenever your blood type is needed.`
          );
        } else {
          await sendMessage(
            chatId,
            `Send /start to get your Telegram chat ID and setup instructions for LifeLink.`
          );
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[poll] network/error:", msg);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

poll();
