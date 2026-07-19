import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/profile/connect-telegram
 * Body: { telegramChatId: number }
 *
 * Links the authenticated user's profile to a Telegram chat_id.
 * Validates that the chat_id is not already claimed by another user.
 */
export const POST = async (req: Request) => {
  const { telegramChatId } = await req.json();
  const chatId = Number(telegramChatId);

  if (!chatId || chatId <= 0 || !Number.isFinite(chatId)) {
    return NextResponse.json(
      { error: "Valid telegramChatId required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if this chat_id is already claimed by someone else
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "This Telegram chat ID is already connected to another account." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ telegram_chat_id: chatId })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, telegramChatId: chatId });
};

/**
 * DELETE /api/profile/connect-telegram
 * Unlinks the user's Telegram from their profile.
 */
export const DELETE = async (_req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ telegram_chat_id: null })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
