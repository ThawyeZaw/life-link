import { NewRequestForm } from "@/components/request/NewRequestForm";

const NewRequestPage = () => (
  <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8 md:max-w-lg">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Request blood</h1>
      <p className="mt-1 text-base text-slate-500">
        Takes under a minute. We&apos;ll scan for compatible donors near your hospital right away.
      </p>
    </div>
    <NewRequestForm />
  </div>
);

export default NewRequestPage;
