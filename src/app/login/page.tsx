import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

const LoginPage = () => (
  <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 md:py-12">
    <div className="flex flex-col items-center gap-2 text-center">
      <Image src="/logo.png" alt="LifeLink" width={56} height={56} className="rounded-2xl" />
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="text-base text-slate-500">Log in to continue saving lives.</p>
    </div>

    <Suspense>
      <LoginForm />
    </Suspense>

    <p className="text-center text-sm text-slate-500">
      New to LifeLink?{" "}
      <Link href="/signup" className="font-semibold text-red-600 hover:underline">
        Create an account
      </Link>
    </p>
  </div>
);

export default LoginPage;
