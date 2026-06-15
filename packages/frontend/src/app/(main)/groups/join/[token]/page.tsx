import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { requireOrgVerifiedPageSession } from "@/lib/auth/pageGuard";
import JoinGroupClient from "./JoinGroupClient";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await requireOrgVerifiedPageSession(`/groups/join/${token}`);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg-default)",
      }}
    >
      <Navigation />
      <main className="main-container">
        <JoinGroupClient token={token} />
      </main>
      <Footer />
    </div>
  );
}
