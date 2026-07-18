// Contact — two-column split: localized contact info + form
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { Droplets, Mail, MapPin, Building2, Clock } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — LifeLink",
  description: "Get in touch with the LifeLink team — partner hospital inquiries and emergency coordination in Yangon, Myanmar.",
};

const CONTACT_POINTS = [
  {
    icon: Building2,
    title: "Partner Hospitals Inquiry",
    detail: "Onboard your facility to the live request network — from Yangon General Hospital to Asia Royal.",
  },
  {
    icon: Mail,
    title: "Emergency Email",
    detail: "emergency@lifelink.com.mm",
  },
  {
    icon: MapPin,
    title: "Location",
    detail: "Yangon, Myanmar",
  },
  {
    icon: Clock,
    title: "Coverage",
    detail: "24/7 emergency dispatch, every day of the year.",
  },
];

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600">
            Get in Touch
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-500 md:text-lg">
            Whether you are a hospital coordinator or a donor hero — we would love
            to hear from you.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left — contact info */}
          <div className="space-y-4">
            {CONTACT_POINTS.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <Icon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </section>

      <footer className="px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Built with <Droplets className="inline h-3 w-3 text-red-500" /> for Myanmar · LifeLink Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
