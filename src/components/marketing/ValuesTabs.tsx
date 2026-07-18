"use client";

// ValuesTabs — interactive vertical tabs with Apple liquid glass editorial content
// Thinzar Kyaw — Frontend Domain

import { useState } from "react";
import { clsx } from "clsx";

interface TabContent {
  key: string;
  label: string;
  heading: string;
  body: string;
  image: string;
}

const TABS: TabContent[] = [
  {
    key: "speed",
    label: "Speed",
    heading: "Minutes matter.",
    body: "When a CRITICAL AB- request hits the board at Yangon General Hospital, matched donors in Sanchaung are pinged instantly — before the family finishes the paperwork.",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=motion%20blur%20photograph%20of%20medical%20courier%20on%20motorbike%20rushing%20through%20Yangon%20Myanmar%20streets%20at%20dusk%2C%20red%20cooler%20box%2C%20urgent%20cinematic%20mood&image_size=landscape_4_3",
  },
  {
    key: "reliability",
    label: "Reliability",
    heading: "Verified, every time.",
    body: "202 partner hospitals from Asia Royal to Pun Hlaing Siloam. Every request is signed off by an on-duty coordinator — no rumors, no duplicate broadcasts.",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20photograph%20of%20hospital%20coordinator%20verifying%20blood%20supply%20records%20on%20tablet%20in%20modern%20Myanmar%20hospital%2C%20clean%20bright%20interior%2C%20trustworthy%20atmosphere&image_size=landscape_4_3",
  },
  {
    key: "compassion",
    label: "Compassion",
    heading: "Donors are heroes.",
    body: "Donors like Ko Aung and Ma Thida have answered dozens of urgent requests. Every donation is tracked in their Donor Passport — a record of lives saved.",
    image:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=heartwarming%20photograph%20of%20Myanmar%20blood%20donor%20receiving%20thank%20you%20card%20from%20nurse%2C%20soft%20warm%20light%2C%20emotional%20genuine%20moment%2C%20editorial%20style&image_size=landscape_4_3",
  },
];

export const ValuesTabs = () => {
  const [activeKey, setActiveKey] = useState("speed");
  const active = TABS.find((t) => t.key === activeKey) ?? TABS[0];

  return (
    <section className="water-ripple px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Tab list — glass panel */}
        <div className="glass-surface flex flex-col rounded-2xl p-1 lg:col-span-4" role="tablist" aria-label="Our values">
          <h2 className="mb-2 px-5 pt-4 text-3xl font-extrabold tracking-tight text-gray-900">
            Why LifeLink
          </h2>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeKey === tab.key}
              onClick={() => setActiveKey(tab.key)}
              className={clsx(
                "min-h-[44px] rounded-xl px-6 py-4 text-left text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500",
                activeKey === tab.key
                  ? "bg-white/80 text-red-600 shadow-sm"
                  : "text-slate-500 hover:bg-white/40 hover:text-gray-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content — image with liquid glass overlay text box */}
        <div className="relative lg:col-span-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.image}
            alt={active.heading}
            className="h-[400px] w-full rounded-2xl bg-slate-200 object-cover shadow-lg"
          />
          <div className="glass-overlay mt-4 rounded-2xl p-8 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:max-w-sm">
            {/* Light refraction highlight */}
            <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            <h3 className="text-2xl font-extrabold text-gray-900">{active.heading}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{active.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
