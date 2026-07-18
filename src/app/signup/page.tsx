import Link from "next/link";
import Image from "next/image";
import { SignupForm } from "@/components/auth/SignupForm";

const SignupPage = () => (
  <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 md:py-12">
    <div className="flex flex-col items-center gap-2 text-center">
      <Image src="/logo.png" alt="LifeLink" width={56} height={56} className="rounded-2xl" />
      <h1 className="text-2xl font-bold text-slate-900">Join LifeLink</h1>
      <p className="text-base text-slate-500">
        One profile. When someone nearby needs your blood type, we alert you —
        your location and contact stay private until you say yes.
      </p>
    </div>

    <SignupForm />

    <p className="text-center text-sm text-slate-500">
      Already have an account?{" "}
      <Link href="/login" className="font-semibold text-red-600 hover:underline">
        Log in
      </Link>
    </p>
  </div>
);

export default SignupPage;
