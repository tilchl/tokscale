import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSessionFromRequest } from "@/lib/auth/requestSession";
import { issuePersonalToken, listPersonalTokens } from "@/lib/auth/personalTokens";
import { isGitHubOrgRestrictionEnabled } from "@/lib/auth/github";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

const DEFAULT_TOKEN_NAME = "CI token";
const MAX_TOKEN_NAME_LENGTH = 100;

function normalizeTokenName(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_TOKEN_NAME;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_TOKEN_NAME;
  }

  return trimmed.slice(0, MAX_TOKEN_NAME_LENGTH);
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokens = await listPersonalTokens(session.id);

    return NextResponse.json({
      tokens: tokens.map((token) => ({
        id: token.id,
        name: token.name,
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt,
      })),
    });
  } catch (error) {
    console.error("Tokens list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request, {
      allowAuthorizationHeader: false,
    });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (isGitHubOrgRestrictionEnabled()) {
      const [user] = await db
        .select({ orgVerifiedAt: users.orgVerifiedAt })
        .from(users)
        .where(eq(users.id, session.id))
        .limit(1);

      if (!user?.orgVerifiedAt) {
        return NextResponse.json(
          { error: "GitHub organization membership is required. Please sign in again." },
          { status: 403 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const rawName =
      body && typeof body === "object" ? (body as { name?: unknown }).name : undefined;
    const issuedToken = await issuePersonalToken({
      userId: session.id,
      name: normalizeTokenName(rawName),
      ensureUniqueName: true,
    });

    return NextResponse.json(
      {
        token: {
          id: issuedToken.id,
          name: issuedToken.name,
          token: issuedToken.token,
          createdAt: issuedToken.createdAt,
          lastUsedAt: issuedToken.lastUsedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Token create error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
