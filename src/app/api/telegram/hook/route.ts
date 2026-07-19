import { NextResponse } from "next/server";
import { handleMessage } from "@/lib/telegram";

/**
 * POST /api/telegram/hook
 *
 * Telegram webhook endpoint. Set this URL as the bot's webhook:
 *   curl https://api.telegram.org/bot<TOKEN>/setWebhook \
 *     -d url=https://lifelink-henna.vercel.app/api/telegram/hook \
 *     -d secret_token=<TELEGRAM_WEBHOOK_SECRET>
 *
 * Telegram sends { update_id, message: { chat, text, from } } here.
 * The optional secret_token helps reject spoofed webhook calls.
 */
export const POST = async (req: Request) => {
  // Verify secret token if configured
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = req.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== expectedSecret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();

  // Ignore non-message updates (e.g., edited messages, callbacks)
  const msg = body?.message;
  if (!msg || !msg.chat) {
    return NextResponse.json({ ok: true });
  }

  try {
    const reply = await handleMessage(msg);
    if (!reply) {
      return NextResponse.json({ ok: true });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
    if (!token) {
      return NextResponse.json({ ok: false, error: "no token" }, { status: 500 });
    }

    // Send reply back to the user
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: msg.chat.id,
        text: reply,
        parse_mode: "Markdown",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[telegram hook error]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
};
