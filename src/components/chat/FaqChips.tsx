"use client";

import { useState } from "react";
import clsx from "clsx";

interface FaqChip {
  labelEn: string;
  labelMm: string;
  query: string;
}

const FAQS: FaqChip[] = [
  {
    labelEn: "Who can donate?",
    labelMm: "ဘယ်သူတွေ သွေးလှူလို့ရလဲ",
    query: "Who is eligible to donate blood in Myanmar? What are the requirements?",
  },
  {
    labelEn: "Blood types explained",
    labelMm: "သွေးအုပ်စုရှင်းလင်းချက်",
    query: "Explain blood type compatibility. Which blood types are compatible with each other?",
  },
  {
    labelEn: "After donation care",
    labelMm: "သွေးလှူပြီးနောက် ဂရုစိုက်ရန်",
    query: "What should I do after donating blood? How to recover quickly?",
  },
  {
    labelEn: "Dengue warning signs",
    labelMm: "သွေးလွန်တုပ်ကွေး သတိပေးလက္ခဏာများ",
    query: "What are the warning signs of dengue fever? When should I go to the hospital?",
  },
  {
    labelEn: "Foods for anemia",
    labelMm: "သွေးအားနည်းရောဂါအတွက် အာဟာရ",
    query: "What foods help with anemia? Iron-rich foods in Myanmar diet?",
  },
  {
    labelEn: "How LifeLink works",
    labelMm: "LifeLink အသုံးပြုနည်း",
    query: "How does LifeLink work? How can I request blood or register as a donor?",
  },
];

interface FaqChipsProps {
  onSelect: (query: string) => void;
  /** Visible only when the conversation is fresh (no user messages yet). */
  visible: boolean;
  /** Current UI language for chip labels. */
  lang: "en" | "mm";
}

export const FaqChips = ({ onSelect, visible, lang }: FaqChipsProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <div className="px-4 pb-2">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        {lang === "mm" ? "အမြန်မေးခွန်းများ" : "Quick questions"}
      </p>
      <div className="flex flex-wrap gap-2">
        {FAQS.map((faq) => (
          <button
            key={faq.query}
            type="button"
            onClick={() => {
              setDismissed(true);
              onSelect(faq.query);
            }}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              "border-slate-200 bg-white text-slate-700",
              "hover:border-red-300 hover:bg-red-50 hover:text-red-700",
              "active:scale-95",
            )}
          >
            {lang === "mm" ? faq.labelMm : faq.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
};
