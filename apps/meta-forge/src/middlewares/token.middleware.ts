import { and, eq, isNull } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";
import { apiTokens } from "../shared/schema/api-tokens.ts";
import { users } from "../shared/schema/users.ts";

const tokenPattern = /^mf\.([0-9a-f-]{36})\.([A-Za-z0-9_-]+)$/;

export const tokenMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const match = token?.match(tokenPattern);
  if (!match) {
    return c.json({ message: "Authentication required" }, 401);
  }

  const [, tokenId, secret] = match;
  if (!tokenId || !secret) {
    return c.json({ message: "Invalid token" }, 401);
  }
  const { db } = getAppContext();
  const [row] = await db
    .select({
      user: users,
      secretHash: apiTokens.secretHash,
    })
    .from(apiTokens)
    .innerJoin(users, eq(apiTokens.userId, users.id))
    .where(
      and(
        eq(apiTokens.id, tokenId),
        isNull(apiTokens.revokedAt),
        eq(users.isActive, true),
      ),
    );
  if (!row || row.secretHash !== (await hashTokenSecret(secret))) {
    return c.json({ message: "Invalid token" }, 401);
  }

  const appContext = getAppContext();
  appContext.user = row.user;
  return next();
};

export async function hashTokenSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
