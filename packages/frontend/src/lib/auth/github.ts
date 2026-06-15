const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
const GITHUB_REDIRECT_URI = `${NEXT_PUBLIC_URL}/api/auth/github/callback`;

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

export function getAllowedGitHubOrgs(): string[] {
  const raw = process.env.GITHUB_ALLOWED_ORGS;

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((org) => org.trim().toLowerCase())
    .filter(Boolean);
}

export function isGitHubOrgRestrictionEnabled(): boolean {
  return getAllowedGitHubOrgs().length > 0;
}

/**
 * Get GitHub OAuth authorization URL.
 */
export function getAuthorizationUrl(state: string): string {
  const scopes = ["read:user", "user:email"];
  if (isGitHubOrgRestrictionEnabled()) {
    scopes.push("read:org");
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: scopes.join(" "),
    state,
  });

  return `https://github.com/login/oauth/authorize?${params}`;
}

/**
 * Exchange authorization code for access token.
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`
    );
  }

  return data.access_token;
}

/**
 * Fetch user profile from GitHub API.
 */
export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub user: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user's primary email from GitHub API.
 */
export async function getGitHubUserEmail(
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const emails: Array<{ email: string; primary: boolean; verified: boolean }> =
      await response.json();

    const primaryEmail = emails.find((e) => e.primary && e.verified);
    return primaryEmail?.email || null;
  } catch {
    return null;
  }
}

export async function getAllowedGitHubOrgMembership(
  accessToken: string
): Promise<string | null> {
  const allowedOrgs = getAllowedGitHubOrgs();

  if (allowedOrgs.length === 0) {
    return null;
  }

  const response = await fetch("https://api.github.com/user/orgs?per_page=100", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub orgs: ${response.status}`);
  }

  const orgs: Array<{ login?: unknown }> = await response.json();
  const allowed = new Set(allowedOrgs);

  for (const org of orgs) {
    if (typeof org.login !== "string") {
      continue;
    }

    const login = org.login.toLowerCase();
    if (allowed.has(login)) {
      return login;
    }
  }

  return null;
}
