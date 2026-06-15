import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";
import { isGitHubOrgRestrictionEnabled } from "./github";

export async function requireOrgVerifiedPageSession(
  returnTo: string
): Promise<SessionUser | null> {
  if (!isGitHubOrgRestrictionEnabled()) {
    return null;
  }

  const session = await getSession();

  if (!session) {
    const params = new URLSearchParams({ returnTo });
    redirect(`/api/auth/github?${params}`);
  }

  return session;
}
