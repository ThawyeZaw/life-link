// ⚠️ CROSS-BOUNDARY: This hook lives with the frontend (Thinzar's domain) but
// calls the /api/chat route owned by Thaw Ye Zaw. Review with both owners.
"use client";

import { useState } from "react";

export interface ChatMessageData {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: ChatMessageData = {
  role: "assistant",
  content:
    "Hi! I'm the LifeLink Assistant. Ask me anything about blood donation, first aid, or how to use LifeLink. 🩸",
};

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const next: ChatMessageData[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(next);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME) }),
      });
      const data = await res.json().catch(() => null);
      const reply: string =
        res.ok && data?.reply
          ? data.reply
          : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error — please check your connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
};
