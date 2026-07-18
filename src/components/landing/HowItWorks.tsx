import { Radar, Mail, Link2, HeartHandshake } from "lucide-react";

const STEPS = [
  {
    icon: Radar,
    title: "Radar finds donors",
    text: "Create a request and our radar scans for compatible donors near your hospital — anonymously.",
  },
  {
    icon: Mail,
    title: "Donors get an email",
    text: "Matched donors receive an alert with the hospital and blood type. No personal data is exposed.",
  },
  {
    icon: Link2,
    title: "Consent-based linking",
    text: "Only when a donor accepts do they share their phone number — directly with the requester.",
  },
  {
    icon: HeartHandshake,
    title: "Donate & track",
    text: "Meet at the hospital, donate, and the request status updates from matched to completed.",
  },
];

export const HowItWorks = () => (
  <section className="mx-auto max-w-5xl px-4 py-14">
    <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
      How LifeLink works
    </h2>
    <p className="mx-auto mt-2 max-w-md text-center text-base text-slate-500">
      Four steps. Minimal effort. Maximum privacy.
    </p>
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, i) => (
        <div key={step.title} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <step.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-red-600">Step {i + 1}</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
          <p className="text-sm leading-relaxed text-slate-500">{step.text}</p>
        </div>
      ))}
    </div>
  </section>
);
