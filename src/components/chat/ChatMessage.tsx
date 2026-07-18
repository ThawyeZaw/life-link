import { HeartPulse } from "lucide-react";

import Image from "next/image";
import clsx from "clsx";
import type { ChatMessageData } from "@/hooks/useChat";

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex items-end gap-2", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <Image
            src="/logo.png"
            alt="LifeLink"
            width={44}
            height={44}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-base leading-relaxed",
          isUser
            ? "rounded-br-md bg-red-600 text-white"
            : "rounded-bl-md bg-slate-100 text-slate-800",
        )}
      >
        {message.content}
      </div>
    </div>
  );
};
