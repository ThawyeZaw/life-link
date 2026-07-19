"use client";

import { use } from "react";

import { useT } from "@/i18n";
import { MatchResponder } from "@/components/match/MatchResponder";

const MatchPage = ({ params }: { params: Promise<{ token: string }> }) => {
  const { t } = useT();
  const { token } = use(params);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <MatchResponder token={token} />
    </div>
  );
};

export default MatchPage;
