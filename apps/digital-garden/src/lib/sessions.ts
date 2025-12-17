import crypto from "node:crypto";
import type { APIContext } from "astro";
import { eq, sql } from "drizzle-orm";
import { type Session, sessionSchema, sessions } from "../schema/sessions";

interface SessionWithToken extends Session {
  token: string;
}

const inactivityTimeoutInSeconds = 60 * 60 * 24 * 10; // 10 days
const validatedAtUpdateIntervalInSeconds = 60 * 60; // 1 hour

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

  // inactivity timeout
  if (
    now.getTime() - new Date(session.lastValidatedAt).getTime() >=
    inactivityTimeoutInSeconds * 1000
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
): Promise<[session: Session | null, validatedAtWasUpdated: boolean]> {
  const now = new Date();
  const { db } = ctx.locals;

  const tokenSplits = token.split(".");
  if (tokenSplits.length !== 2) {
    return [null, false];
  }
  const [sessionId, sessionSecret] = tokenSplits;
  if (!sessionId || !sessionSecret) {
    return [null, false];
  }

  const session = await getSession(ctx, sessionId);
  if (!session) {
    return [null, false];
  }

  const tokenSecretHash = await hashSecret(sessionSecret);
  const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash);
  if (!validSecret) {
    return [null, false];
  }

  let updated: Session | null = null;
  if (
    now.getTime() - new Date(session.lastValidatedAt).getTime() >=
    validatedAtUpdateIntervalInSeconds * 1000
  ) {
    const [rawUpdated] = await db
      .update(sessions)
      .set({ lastValidatedAt: sql`(CURRENT_TIMESTAMP)` })
      .where(eq(sessions.id, session.id))
      .returning();

    updated = sessionSchema.parse(rawUpdated);
  }

  return [updated ?? session, !!updated];
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

export function setSessionCookie(ctx: APIContext, sessionToken: string): void {
  ctx.cookies.set("session", sessionToken, {
    secure: ctx.url.hostname !== "localhost",
    path: "/",
    httpOnly: true,
    maxAge: inactivityTimeoutInSeconds,
  });
}
