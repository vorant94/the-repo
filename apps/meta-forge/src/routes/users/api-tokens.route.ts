import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { hashTokenSecret } from "../../middlewares/token.middleware.ts";
import { getAppContext } from "../../shared/app-context.ts";
import type { HonoEnv } from "../../shared/hono-env.ts";
import { apiTokens } from "../../shared/schema/api-tokens.ts";
import { users } from "../../shared/schema/users.ts";

export const apiTokensRoute = new Hono<HonoEnv>();

const tokenUserParamSchema = z.object({ userId: z.uuid() });
const tokenRevokeParamSchema = tokenUserParamSchema.extend({
  tokenId: z.uuid(),
});

apiTokensRoute.post(
  "/",
  describeRoute({
    tags: ["api tokens"],
    description:
      "Issue a non-expiring token; secret is returned once. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      201: { description: "Issued token" },
    },
  }),
  validator("param", tokenUserParamSchema),
  async (c) => {
    const { db } = getAppContext();
    const { userId } = c.req.valid("param");
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId));
    if (!user) {
      throw new HTTPException(404, { message: "User was not found" });
    }
    const tokenId = crypto.randomUUID();
    const secret = Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    await db.insert(apiTokens).values({
      id: tokenId,
      userId,
      secretHash: await hashTokenSecret(secret),
    });
    return c.json({ id: tokenId, token: `mf.${tokenId}.${secret}` }, 201);
  },
);

apiTokensRoute.post(
  "/:tokenId/revoke",
  describeRoute({
    tags: ["api tokens"],
    description: "Revoke a token. Requires system admin access.",
    responses: {
      403: { description: "Insufficient permission" },
      200: { description: "Revoked token" },
    },
  }),
  validator("param", tokenRevokeParamSchema),
  async (c) => {
    const { db } = getAppContext();
    const { userId, tokenId } = c.req.valid("param");
    const [token] = await db
      .update(apiTokens)
      .set({ revokedAt: new Date().toISOString() })
      .where(and(eq(apiTokens.id, tokenId), eq(apiTokens.userId, userId)))
      .returning({ id: apiTokens.id });
    if (!token) {
      throw new HTTPException(404, { message: "Token was not found" });
    }
    return c.json(token);
  },
);
