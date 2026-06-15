import Link from "next/link";
import { getAllowedGitHubOrgs } from "@/lib/auth/github";

const ERROR_MESSAGES: Record<string, string> = {
  org_not_allowed: "Your GitHub account is not a member of an allowed organization.",
  oauth_error: "GitHub sign-in was cancelled or failed.",
  missing_params: "GitHub did not return the required sign-in parameters.",
  invalid_state: "The sign-in session expired. Please try again.",
  state_mismatch: "The sign-in session could not be verified. Please try again.",
  auth_failed: "Sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { error, returnTo } = await searchParams;
  const allowedOrgs = getAllowedGitHubOrgs();
  const signInParams = new URLSearchParams({ returnTo: returnTo || "/leaderboard" });
  const message = error ? ERROR_MESSAGES[error] || "Sign-in failed." : null;

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "radial-gradient(circle at top, #10233e, #030712 55%)",
      color: "white",
      fontFamily: "var(--font-figtree)",
    }}>
      <section style={{
        width: "100%",
        maxWidth: 460,
        padding: 32,
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 24,
        background: "rgba(3,7,18,0.72)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
      }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 32 }}>Sign in to Tokscale</h1>
        <p style={{ margin: "0 0 24px", color: "#b8c7d9", lineHeight: 1.6 }}>
          Access is limited to GitHub members of {allowedOrgs.length > 0 ? allowedOrgs.join(", ") : "the configured organization"}.
        </p>
        {message ? (
          <p style={{
            margin: "0 0 20px",
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(248,113,113,0.14)",
            color: "#fecaca",
          }}>
            {message}
          </p>
        ) : null}
        <Link
          href={`/api/auth/github?${signInParams}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 48,
            borderRadius: 999,
            background: "white",
            color: "#030712",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Continue with GitHub
        </Link>
      </section>
    </main>
  );
}
