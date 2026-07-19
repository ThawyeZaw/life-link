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
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // Production domain — auto-detects on Vercel, hardcoded as safety net
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.includes("vercel.app")) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://lifelink-henna.vercel.app";
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
/** Blood type compatibility lookup table. */
const COMPATIBILITY: Record<string, { canGiveTo: string; canReceiveFrom: string }> = {
  "O-":  { canGiveTo: "All types (universal donor)", canReceiveFrom: "O-" },
  "O+":  { canGiveTo: "O+, A+, B+, AB+",            canReceiveFrom: "O+, O-" },
  "A-":  { canGiveTo: "A-, A+, AB-, AB+",            canReceiveFrom: "A-, O-" },
  "A+":  { canGiveTo: "A+, AB+",                     canReceiveFrom: "A+, A-, O+, O-" },
  "B-":  { canGiveTo: "B-, B+, AB-, AB+",            canReceiveFrom: "B-, O-" },
  "B+":  { canGiveTo: "B+, AB+",                     canReceiveFrom: "B+, B-, O+, O-" },
  "AB-": { canGiveTo: "AB-, AB+",                    canReceiveFrom: "All Rh-negative types" },
  "AB+": { canGiveTo: "AB+",                         canReceiveFrom: "All types (universal recipient)" },
};

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

  // /start — give user their chat ID + overview
  if (text === "/start") {
    return (
      `👋 Hi <b>${h(firstName)}</b>! Welcome to the <b>LifeLink</b> blood donation network.\n\n` +
      `🔢 Your Telegram chat ID is: <code>${chatId}</code>\n\n` +
      `To receive instant blood donation alerts:\n` +
      `1. Log in to LifeLink\n` +
      `2. Find <b>Telegram alerts</b> on your dashboard\n` +
      `3. Enter your chat ID <code>${chatId}</code> and tap <b>Connect</b>\n\n` +
      `─ ♦ ─\n\n` +
      `<b>Available commands:</b>\n` +
      `/help — See all commands\n` +
      `/donate — Blood donation eligibility & tips\n` +
      `/compatible <type> — Check blood type compatibility\n` +
      `/dengue — Dengue warning signs\n` +
      `/anemia — Anemia information & iron-rich foods\n` +
      `/faq — Common blood donation myths & facts\n\n` +
      `Once connected, you'll receive urgent alerts here whenever your blood type is needed. 🩸`
    );
  }

  // /help — list commands
  if (text === "/help") {
    return (
      `<b>🤖 LifeLink Bot Commands</b>\n\n` +
      `/start — Get your chat ID & setup instructions\n` +
      `/donate — Who can donate? Requirements & preparation\n` +
      `/compatible O+ (or any type) — Blood compatibility check\n` +
      `/dengue — Dengue fever warning signs & prevention\n` +
      `/anemia — Understanding anemia & Myanmar iron-rich foods\n` +
      `/faq — Common myths about blood donation\n\n` +
      `🌐 Visit LifeLink: lifelink-henna.vercel.app`
    );
  }

  // /donate — blood donation FAQ
  if (text === "/donate") {
    return (
      `<b>🩸 Blood Donation — Quick Guide</b>\n\n` +
      `<b>Eligibility (Myanmar standards):</b>\n` +
      `• Age: 18–60 years\n` +
      `• Weight: ≥ 45 kg (ideally 50 kg)\n` +
      `• Good general health — no fever, cold, or infection\n` +
      `• Hemoglobin ≥ 12.5 g/dL (women) / 13.0 g/dL (men)\n\n` +
      `<b>Before donating:</b>\n` +
      `• Eat a light meal (avoid oily food)\n` +
      `• Drink plenty of water\n` +
      `• Sleep well (7–8 hours)\n` +
      `• Avoid alcohol for 24 hours\n\n` +
      `<b>After donating:</b>\n` +
      `• Rest 10–15 min at the donation site\n` +
      `• Drink extra fluids\n` +
      `• Avoid heavy lifting/exercise for the day\n` +
      `• Eat iron-rich foods (lahpet, liver, dark greens, eggs)\n\n` +
      `⏱ Whole blood: donate every 3–4 months\n` +
      `❌ Common myth: Donation does NOT weaken you long-term!`
    );
  }

  // /compatible <bloodtype> — compatibility lookup
  const compatMatch = text.match(/^\/compatible\s+(A|B|AB|O)[+-]$/i);
  if (compatMatch) {
    const bloodType = compatMatch[0].replace("/compatible ", "").toUpperCase();
    const info = COMPATIBILITY[bloodType];
    if (info) {
      return (
        `<b>🩸 Blood Type ${bloodType} Compatibility</b>\n\n` +
        `<b>Can donate to:</b>\n${info.canGiveTo}\n\n` +
        `<b>Can receive from:</b>\n${info.canReceiveFrom}\n\n` +
        `💡 O- is the universal donor. AB+ is the universal recipient.`
      );
    }
  }

  // /compatible without args — show guide
  if (text.startsWith("/compatible")) {
    return (
      `<b>🩸 Blood Type Compatibility</b>\n\n` +
      `Type a blood type after the command, e.g.:\n` +
      `<code>/compatible O+</code>\n\n` +
      `Valid types: O-, O+, A-, A+, B-, B+, AB-, AB+\n\n` +
      `💡 <b>Quick reference:</b>\n` +
      `• O- → universal donor (can give to ALL types)\n` +
      `• AB+ → universal recipient (can receive ALL types)`
    );
  }

  // /dengue — dengue fever info
  if (text === "/dengue") {
    return (
      `<b>🦟 Dengue Fever — Warning Signs</b>\n\n` +
      `Dengue is common in Myanmar during monsoon season (June–October).\n\n` +
      `<b>⚠️ Seek immediate hospital care if you see:</b>\n` +
      `• Severe abdominal pain\n` +
      `• Persistent vomiting\n` +
      `• Bleeding gums or nose\n` +
      `• Blood in vomit or stool\n` +
      `• Extreme lethargy or restlessness\n` +
      `• Cold, clammy skin\n\n` +
      `<b>DO NOT</b> take ibuprofen or aspirin — they increase bleeding risk.\n` +
      `Use paracetamol (acetaminophen) only for fever.\n\n` +
      `<b>Prevention:</b>\n` +
      `• Use mosquito repellent & nets\n` +
      `• Eliminate standing water around your home\n` +
      `• Seek medical care early if fever persists > 2 days\n\n` +
      `🏥 Yangon General Hospital Emergency: 01-256112`
    );
  }

  // /anemia — anemia info
  if (text === "/anemia") {
    return (
      `<b>🩸 Anemia (သွေးအားနည်းရောဂါ)</b>\n\n` +
      `Anemia is very common in Myanmar. Common causes: iron deficiency, thalassemia, poor diet, or hookworm.\n\n` +
      `<b>Symptoms:</b> fatigue, pale palms, dizziness, shortness of breath, cold hands/feet.\n\n` +
      `<b>🥘 Iron-rich Myanmar foods:</b>\n` +
      `• Lahpet (လက်ဖက်) — fermented tea leaves\n` +
      `• Liver — pork, beef, or chicken (အသည်း)\n` +
      `• Dark leafy greens — ဟင်းနုနွယ်, မုန်ညင်းရွက်\n` +
      `• Dried shrimp, eggs, black sesame (နှမ်းမည်း)\n` +
      `• Beans & legumes (ပဲအမျိုးမျိုး)\n` +
      `• Guava (ဂွေးသီး), jaggery (ထန်းလျက်)\n\n` +
      `💡 Combine iron foods with Vitamin C (citrus, tomatoes, ဆီးဖြူသီး) for better absorption.\n\n` +
      `👨‍⚕️ See a doctor for proper diagnosis and treatment.`
    );
  }

  // /faq — common myths
  if (text === "/faq") {
    return (
      `<b>✅ Blood Donation — Facts vs Myths</b>\n\n` +
      `❌ "သွေးလှူရင် ကိုယ်တွင်းသွေးတွေ နည်းသွားတယ်"\n` +
      `✅ Body replaces plasma in 24–48 hrs and red cells in 4–6 weeks.\n\n` +
      `❌ "သွေးလှူရင် အားနည်းသွားတယ်" (Makes you permanently weak)\n` +
      `✅ Temporary mild fatigue is normal; full recovery is quick with rest & nutrition.\n\n` +
      `❌ "သွေးလှူရင် ရောဂါကူးစက်နိုင်တယ်"\n` +
      `✅ Sterile, single-use equipment — zero risk of infection to the donor.\n\n` +
      `❌ "သွေးအုပ်စုတူမှ သွေးလှူလို့ရတယ်"\n` +
      `✅ Compatibility is broader than same-type-only. O- can donate to anyone!\n\n` +
      `🩸 One donation can save up to 3 lives. Your body fully regenerates everything.`
    );
  }

  // Any other text — friendly reminder with /help
  return (
    `👋 Send <b>/start</b> to get your Telegram chat ID.\n` +
    `Send <b>/help</b> for all available commands.\n` +
    `Or ask about blood donation with <b>/donate</b>, <b>/dengue</b>, or <b>/faq</b>.`
  );
};
