// ⚠️ CROSS-BOUNDARY: This API route is in Thaw Ye Zaw's domain but is consumed
// by the ChatBot component (Thinzar's domain). Review with both owners before merging.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * POST /api/chat — server-side proxy to the DeepSeek LLM.
 * Keeps DEEPSEEK_API_KEY secret; the browser never talks to DeepSeek directly.
 *
 * Request body: { messages: Array<{ role: "user" | "assistant"; content: string }> }
 * Response:     { reply: string }
 */

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const MAX_TURNS = 12;
const MAX_CHARS = 2000;

const SYSTEM_PROMPT = `You are the LifeLink Assistant — a warm, concise, and reliable helper for LifeLink, a real-time platform connecting blood donors, hospitals, and urgent medical needs across Myanmar.

You are knowledgeable about:

1. THE LIFELINK PLATFORM
- Users sign up as individuals (donors) or organizations at /signup, log in at /login.
- Anyone in need can post a blood request at /requests/new (choose hospital, blood type, units, urgency: CRITICAL / URGENT / STANDARD).
- The dashboard (/dashboard) shows availability toggle, invitations, and my requests.
- The map (/map) shows hospitals and active blood needs across Yangon.
- Matching: requesters search nearby compatible donors; donors receive an email invitation with accept/decline links — no login needed to respond.
- Donor privacy: contact details are only shared after a donor accepts.

2. BLOOD DONATION FAQs
- Eligibility: generally 18–60 years old, weight ≥ 50 kg, in good health.
- Interval: wait at least 3–4 months between whole-blood donations.
- Compatibility: O- is the universal donor; AB+ is the universal recipient. Explain type compatibility clearly when asked.
- Debunk common myths (donation does not weaken you long-term, cannot transmit disease to the donor, etc.).
- Before donating: eat well, hydrate, sleep well. After: rest, drink fluids, avoid heavy lifting for a day.

3. FIRST AID (informational only)
- Severe bleeding: apply firm direct pressure with clean cloth, elevate the limb, do not remove soaked dressings — add more on top.
- Shock: lay the person down, raise legs, keep warm.
- Burns, fractures, choking, CPR basics — give clear, step-by-step guidance.
- ALWAYS add: you are not a doctor; for emergencies call an ambulance or go to the nearest hospital immediately (e.g., Yangon General Hospital).

4. GENERAL HEALTH FAQs related to blood, anemia, transfusions, and donation recovery.

Rules:
- Keep answers short and practical (2–6 sentences for most questions). Use simple language.
- If asked something outside these topics, politely steer back to LifeLink, blood donation, or first aid.
- Never invent medical facts. If unsure, recommend consulting a doctor or hospital.
- Respond in the same language the user writes in (English or Burmese).`;

const buildUserContext = (profile: Profile | null) => {
  if (!profile) return "";
  const parts = [
    `The user is logged in as ${profile.full_name} (${profile.account_type}).`,
    profile.blood_type ? `Blood type: ${profile.blood_type}.` : "",
    profile.township ? `Township: ${profile.township}.` : "",
    `Currently ${profile.is_available ? "available" : "unavailable"} to donate.`,
    profile.last_donation_date
      ? `Last donation date: ${profile.last_donation_date}.`
      : "",
  ];
  return `\n\nPERSONAL CONTEXT (use to personalize answers, never reveal raw data unprompted):\n${parts
    .filter(Boolean)
    .join(" ")}`;
};

export const POST = async (req: Request) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chat is not configured (missing DEEPSEEK_API_KEY)" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const rawMessages: unknown = body?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json({ error: "messages[] is required" }, { status: 400 });
  }

  const messages: ChatTurn[] = rawMessages
    .filter(
      (m): m is ChatTurn =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string"
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  // Personalize for logged-in users (public visitors get general answers).
  let profile: Profile | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single<Profile>();
      profile = data;
    }
  } catch {
    // Not logged in or session error — continue as public visitor.
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + buildUserContext(profile) },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 502 }
    );
  }

  const data = await res.json();
  const reply: string =
    data?.choices?.[0]?.message?.content?.trim() ??
    "Sorry, I couldn't generate a reply. Please try again.";

  return NextResponse.json({ reply });
};
