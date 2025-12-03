import crypto from "node:crypto";
import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { type Session, sessionSchema, sessions } from "../schema/sessions";

export interface SessionWithToken extends Session {
  token: string;
}

export const sessionExpiresInSeconds = 60 * 60 * 24;

export async function createSession(
  ctx: APIContext,
  userId: Session["userId"],
): Promise<SessionWithToken> {
  const { db } = ctx.locals;

  const id = crypto.randomUUID();
  const secret = crypto.randomBytes(16).toString("hex");
  const secretHash = await hashSecret(secret);

  const token = `${id}.${secret}`;

  const [rawSession] = await db
    .insert(sessions)
    .values({ id, userId, secretHash: Buffer.from(secretHash) })
    .returning();

  const session = sessionSchema.parse(rawSession);

  return {
    ...session,
    token,
  };
}

async function getSession(
  ctx: APIContext,
  sessionId: string,
): Promise<Session | null> {
  const now = new Date();
  const { db } = ctx.locals;

  const [rawSession] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (!rawSession) {
    return null;
  }

  const session = sessionSchema.parse(rawSession);

  if (
    now.getTime() - new Date(session.createdAt).getTime() >=
    sessionExpiresInSeconds * 1000
  ) {
    await deleteSession(ctx, sessionId);
    return null;
  }

  return session;
}

async function deleteSession(
  ctx: APIContext,
  sessionId: string,
): Promise<void> {
  const { db } = ctx.locals;

  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function validateSessionToken(
  ctx: APIContext,
  token: string,
): Promise<Session | null> {
  const { db } = ctx.locals;

  const tokenSplits = token.split(".");
  if (tokenSplits.length !== 2) {
    return null;
  }
  const [sessionId, sessionSecret] = tokenSplits;
  if (!sessionId || !sessionSecret) {
    return null;
  }

  const [rawSession] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));
  if (!rawSession) {
    return null;
  }

  const session = await getSession(ctx, sessionId);
  if (!session) {
    return null;
  }

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
  if (!validSecret) {
    return null;
  }

  return session;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
  return new Uint8Array(secretHashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    // biome-ignore lint/style/noNonNullAssertion: same length is checked above and we anyway in for loop that doesn't overflow length
    c |= a[i]! ^ b[i]!;
  }
  return c === 0;
}
