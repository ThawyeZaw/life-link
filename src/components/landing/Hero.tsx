import Image from "next/image";
import Link from "next/link";
import { Droplets, MapPin, ShieldCheck } from "lucide-react";

export const Hero = () => (
  <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-white">
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-14 text-center md:py-20">
      <Image
        src="/logo.png"
        alt="LifeLink"
        width={88}
        height={88}
        className="rounded-3xl shadow-md"
        priority
      />
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        Every drop <span className="text-red-600">counts</span>.
      </h1>
      <p className="max-w-xl text-lg text-slate-600">
        LifeLink connects blood donors with patients and hospitals across
        Myanmar — in minutes, not days. Private by design: your location and
        contact are never shared until you say yes.
      </p>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/requests/new"
          className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-200 transition-colors hover:bg-red-700"
        >
          <Droplets className="h-5 w-5" /> I need blood
        </Link>
        <Link
          href="/signup"
          className="flex min-h-13 items-center justify-center gap-2 rounded-full border-2 border-red-600 px-8 py-3.5 text-base font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          Become a donor
        </Link>
      </div>

      <Link
        href="/map"
        className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600"
      >
        <MapPin className="h-4 w-4" /> Browse hospitals needing blood near you →
      </Link>

      <p className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        <ShieldCheck className="h-4 w-4" /> Your exact location is never exposed
        without consent
      </p>
    </div>
  </section>
);
