import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

const HomePage = () => (
  <>
    <Hero />
    <HowItWorks />

    <section className="bg-slate-900 px-4 py-14 text-center">
      <h2 className="text-2xl font-bold text-white md:text-3xl">
        Run a donor community?
      </h2>
      <p className="mx-auto mt-2 max-w-md text-base text-slate-300">
        Create an organization account, invite your members with a single code,
        and coordinate blood requests together.
      </p>
      <Link
        href="/signup"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100"
      >
        Create an organization
      </Link>
    </section>

    <footer className="px-4 py-8 text-center text-sm text-slate-400">
      LifeLink — built for Myanmar. Every drop counts.
    </footer>
  </>
);

export default HomePage;
