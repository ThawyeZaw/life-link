import {
  ArrowDown,
  CheckCircle2,
  HeartHandshake,
  Link2,
  LockKeyhole,
  Mail,
  Radar,
  Radio,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: Radar,
    number: "01",
    title: "Radar finds donors",
    text: "Create a request and LifeLink scans for compatible donors near the hospital without revealing their identities.",
    status: "Scanning",
  },
  {
    icon: Mail,
    number: "02",
    title: "Donors receive an alert",
    text: "Compatible donors receive the hospital, blood type, urgency, and distance while their personal data stays protected.",
    status: "Alert sent",
  },
  {
    icon: Link2,
    number: "03",
    title: "Consent-based connection",
    text: "Contact details are shared only after a donor accepts the invitation and chooses to help.",
    status: "Permission",
  },
  {
    icon: HeartHandshake,
    number: "04",
    title: "Donate and complete",
    text: "The donor visits the hospital, completes the donation, and the request is updated across the LifeLink network.",
    status: "Completed",
  },
];

export const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(226,232,240,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.55) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-red-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Emergency response flow
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            How LifeLink works
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            From emergency request to completed donation, every step is fast,
            private, and based on donor consent.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <SecurityBadge
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            text="Privacy protected"
          />

          <SecurityBadge
            icon={<LockKeyhole className="h-3.5 w-3.5" />}
            text="Consent required"
          />

          <SecurityBadge
            icon={<Radio className="h-3.5 w-3.5" />}
            text="Live updates"
          />
        </div>

        <div className="relative mt-14 hidden lg:block">
          <div className="absolute left-[12.5%] right-[12.5%] top-12 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />

          <div className="grid grid-cols-4 gap-5">
            {STEPS.map((step, index) => (
              <ProcessStep key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>

        <div className="mt-12 space-y-3 lg:hidden">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <ProcessStep step={step} index={index} mobile />

              {index < STEPS.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-sm">
                    <ArrowDown className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-[24px] border border-emerald-200 bg-emerald-50 p-4 shadow-[0_16px_45px_rgba(16,185,129,0.08)] sm:rounded-[28px] sm:p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-100 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  One connected emergency network
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                  Hospitals find help faster while donors remain in full control
                  of their privacy and participation.
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
              Network ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

type Step = (typeof STEPS)[number];
const ProcessStep = ({
  step,
  index,
  mobile = false,
}: {
  step: Step;
  index: number;
  mobile?: boolean;
}) => {
  const Icon = step.icon;

  return (
    <article
      className={`group relative min-w-0 overflow-hidden border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_22px_60px_rgba(239,68,68,0.1)] ${
        mobile ? "rounded-[24px] p-4 sm:p-5" : "rounded-[28px] px-5 pb-5 pt-28"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-red-100/70 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(226,232,240,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.8) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {!mobile && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-red-200" />
            <div className="absolute inset-2.5 rounded-full border border-red-300" />
            <div className="absolute inset-5 rounded-full border border-red-400" />

            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.25)]">
              <Icon className="h-5 w-5" />

              {index === 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        {mobile ? (
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <Icon className="h-5 w-5" />

                {index === 0 && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                  Step {step.number}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  {step.status}
                </p>
              </div>
            </div>

            <span className="shrink-0 font-mono text-2xl font-black text-slate-200">
              {step.number}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Step {step.number}
            </p>

            <span className="font-mono text-xl font-black text-slate-200">
              {step.number}
            </span>
          </div>
        )}

        <h3
          className={`font-black tracking-[-0.025em] text-slate-950 ${
            mobile ? "mt-4 text-lg" : "mt-5 text-xl"
          }`}
        >
          {step.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          <span className="relative flex h-2 w-2">
            {index === 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
            )}

            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                index === STEPS.length - 1 ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </span>

          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {step.status}
          </span>
        </div>
      </div>
    </article>
  );
};

const SecurityBadge = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 shadow-sm sm:text-xs">
      <span className="text-emerald-500">{icon}</span>
      {text}
    </span>
  );
};
