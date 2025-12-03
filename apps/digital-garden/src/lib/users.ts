import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { type User, userSchema, users } from "../schema/users";

export async function createUser(
  ctx: APIContext,
  githubId: User["githubId"],
  username: User["username"],
): Promise<User> {
  const { db } = ctx.locals;

  const id = crypto.randomUUID();
  const [rawUser] = await db
    .insert(users)
    .values({ id, githubId, username })
    .returning();

  return userSchema.parse(rawUser);
}

export async function findUserByGithubId(
  ctx: APIContext,
  githubId: User["githubId"],
): Promise<User | null> {
  const { db } = ctx.locals;

  const [rawUser] = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId));
  if (!rawUser) {
    return null;
  }

  return userSchema.parse(rawUser);
}

export async function findUserById(
  ctx: APIContext,
  id: User["id"],
): Promise<User | null> {
  const { db } = ctx.locals;

  const [rawUser] = await db.select().from(users).where(eq(users.id, id));
  if (!rawUser) {
    return null;
  }

  return userSchema.parse(rawUser);
}
