"use client";

// ContactForm — accessible contact form (UI only, submit stub)
// Thinzar Kyaw — Frontend Domain
// NOTE: onSubmit is an empty stub — wiring belongs to backend (Thaw Ye Zaw).

import { type FormEvent } from "react";
import { Send } from "lucide-react";

const inputClasses =
  "w-full min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500";

export const ContactForm = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO (Backend — Thaw Ye Zaw): wire up contact submission
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-gray-700">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          placeholder="e.g., Ko Aung"
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-gray-700">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-org" className="mb-1.5 block text-sm font-semibold text-gray-700">
          Hospital / Organization
        </label>
        <input
          id="contact-org"
          name="organization"
          type="text"
          placeholder="e.g., Yangon General Hospital"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-gray-700">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Tell us how we can help…"
          required
          className={`${inputClasses} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-base font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <Send className="h-4 w-4" />
        Send Message
      </button>
    </form>
  );
};
