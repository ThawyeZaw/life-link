// SERVER ONLY — Telegram Bot integration using the Bot API (no SDK needed).
// Supports both webhook mode (production) and getUpdates polling (local dev).

export interface DonorInviteParams {
  to: string;
  donorName: string;
  bloodType: string;
  urgency: string;
  unitsNeeded: number;
  hospitalName: string;
  hospitalTownship: string | null;
  distanceKm: number | null;
  token: string;
}

const BOT_TOKEN = () =>
  process.env.TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN_DEV ?? "";

const SITE_URL = () => {
  // Vercel auto-provides this (e.g. "lifelink-henna.vercel.app")
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Custom domain set explicitly
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // Local dev fallback
  return "http://localhost:3000";
};

/** Simple HTML escaping for Telegram parse_mode HTML. */
const h = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const sendTelegramInvite = async (
  chatId: string | number,
  p: DonorInviteParams
) => {
  const token = BOT_TOKEN();
  if (!token) {
    return { sent: false as const, reason: "missing_bot_token" };
  }

  const acceptUrl = `${SITE_URL()}/match/${p.token}`;
  const isHttps = SITE_URL().startsWith("https://");

  const urgencyEmoji: Record<string, string> = {
    CRITICAL: "🔴",
    URGENT: "🟠",
    STANDARD: "🔵",
  };
  const emoji = urgencyEmoji[p.urgency] ?? "🔵";

  const text =
    `${emoji} <b>Blood Donation Request</b>\n\n` +
    `<b>${h(p.donorName)}</b>, a patient near you urgently needs ` +
    `<b>${h(p.bloodType)}</b> blood and you are a compatible donor.\n\n` +
    `<b>Urgency:</b> ${h(p.urgency)}\n` +
    `<b>Blood type:</b> ${h(p.bloodType)} · ${p.unitsNeeded} unit(s)\n` +
    `<b>Donation at:</b> ${h(p.hospitalName)}` +
    `${p.hospitalTownship ? `, ${h(p.hospitalTownship)}` : ""}` +
    `${p.distanceKm != null ? `\n<b>Distance:</b> ~${p.distanceKm} km from you` : ""}` +
    `\n\n` +
    (isHttps
      ? `<i>Tap the button below to accept or decline. Your details stay private until you accept.</i>`
      : `<a href="${acceptUrl}">Respond to this request</a>\n\n<i>Your details stay private until you accept.</i>`);

  // Inline keyboard buttons only work with HTTPS URLs (Telegram restriction).
  // For local dev (HTTP), fall back to a clickable link in the message text.
  const replyMarkup = isHttps
    ? {
        inline_keyboard: [
          [{ text: "🩸 Respond Now", url: acceptUrl }],
        ],
      }
    : undefined;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(replyMarkup && { reply_markup: replyMarkup }),
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`[telegram] sendMessage failed for chat ${chatId}:`, err);
    return { sent: false as const, reason: `Telegram API error: ${err.slice(0, 300)}` };
  }

  return { sent: true as const };
};

/**
 * Process an incoming Telegram message (text only).
 * Returns the reply text to send back to the user via sendMessage.
 */
export const handleMessage = async (
  msg: {
    chat: { id: number };
    text?: string;
    from?: { first_name?: string; last_name?: string };
  }
): Promise<string | null> => {
  const text = msg.text?.trim() ?? "";
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name ?? "there";

  // /start — give the user their chat ID
  if (text === "/start") {
    return (
      `👋 Hi <b>${h(firstName)}</b>! Welcome to the <b>LifeLink</b> blood donation network.\n\n` +
      `🔢 Your Telegram chat ID is: <code>${chatId}</code>\n\n` +
      `To receive instant blood donation alerts:\n` +
      `1. Log in to LifeLink\n` +
      `2. Find <b>Telegram alerts</b> on your dashboard\n` +
      `3. Enter your chat ID <code>${chatId}</code> and tap <b>Connect</b>\n\n` +
      `Once connected, you'll receive urgent alerts here whenever your blood type is needed.`
    );
  }

  // Any other text — just remind them to use /start
  return "Send /start to get your Telegram chat ID and setup instructions for LifeLink.";
};
