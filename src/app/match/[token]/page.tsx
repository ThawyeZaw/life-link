import { MatchResponder } from "@/components/match/MatchResponder";

const MatchPage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <MatchResponder token={token} />
    </div>
  );
};

export default MatchPage;
