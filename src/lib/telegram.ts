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

const BOT_USERNAME = () =>
  process.env.TELEGRAM_BOT_USERNAME ?? "LifeLinkBot";

const SITE_URL = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const sendTelegramInvite = async (
  chatId: string | number,
  p: DonorInviteParams
) => {
  const token = BOT_TOKEN();
  if (!token) {
    return { sent: false as const, reason: "missing_bot_token" };
  }

  const acceptUrl = `${SITE_URL()}/match/${p.token}`;

  const distanceLine =
    p.distanceKm != null ? `\n📏 Distance: ~${p.distanceKm} km from you` : "";

  const text = `🩸 *Blood Donation Request*

Hi ${escapeMd(p.donorName)},

A patient near you urgently needs *${escapeMd(p.bloodType)}* blood and you are a compatible donor.

*Urgency:* ${escapeMd(p.urgency)}
*Blood type:* ${escapeMd(p.bloodType)} · ${p.unitsNeeded} unit(s)
*Donation at:* ${escapeMd(p.hospitalName)}${p.hospitalTownship ? `, ${escapeMd(p.hospitalTownship)}` : ""}${distanceLine}

[Respond to this request](${acceptUrl})

_Your exact location and contact details are never shared unless you accept. You can decline with no questions asked._`;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
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
 * Supports:
 * - /start — tells the user their chat_id and instructions
 * - A 6-digit code — links the chat_id to their LifeLink account
 */
export const handleMessage = async (
  msg: {
    chat: { id: number };
    text?: string;
    from?: { first_name?: string };
  }
): Promise<string | null> => {
  const text = msg.text?.trim() ?? "";
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name ?? "there";

  // /start — give the user their chat ID
  if (text === "/start") {
    return (
      `👋 Hi ${firstName}! Welcome to the *LifeLink* blood donation network.\n\n` +
      `🔢 Your Telegram chat ID is: \`${chatId}\`\n\n` +
      `To receive instant blood donation alerts:\n` +
      `1. Log in to LifeLink at ${SITE_URL()}/dashboard\n` +
      `2. Go to *Settings* and find *Telegram Notifications*\n` +
      `3. Enter your chat ID \`${chatId}\` and tap *Connect*\n\n` +
      `Once connected, you'll receive urgent alerts here whenever your blood type is needed.`
    );
  }

  // Any other text — just remind them to use /start
  return `Send /start to get your Telegram chat ID and setup instructions for LifeLink.`;
};

/** Telegram MarkdownV2-safe escaping (for bold, italic, links to work correctly). */
const escapeMd = (s: string): string =>
  s.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
