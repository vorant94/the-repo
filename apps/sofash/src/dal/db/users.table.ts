import { eq } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { v5 } from "uuid";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { uuidNamespace } from "../../shared/schema/db-config.ts";
import {
  type CreateUser,
  type User,
  type UserRole,
  createUserSchema,
  userRoleSchema,
  userSchema,
  users,
} from "../../shared/schema/users.ts";

export async function createUser(toCreateRaw: CreateUser): Promise<User> {
  const { db } = getContext<HonoEnv>().var;

  const toCreate = createUserSchema.parse(toCreateRaw);

  const [created] = await db
    .insert(users)
    .values({
      id: v5(toCreateRaw.telegramChatId.toString(), uuidNamespace),
      ...toCreate,
    })
    .returning();

  return userSchema.parse(created);
}

export async function findUserByTelegramChatId(
  telegramChatId: User["telegramChatId"],
): Promise<User | null> {
  const { db } = getContext<HonoEnv>().var;

  const [raw] = await db
    .select()
    .from(users)
    .where(eq(users.telegramChatId, telegramChatId));

  return raw ? userSchema.parse(raw) : null;
}

export async function setUserRole(
  id: User["id"],
  toSetRaw: UserRole,
): Promise<User> {
  const { db } = getContext<HonoEnv>().var;

  const toSet = userRoleSchema.parse(toSetRaw);

  const [raw] = await db
    .update(users)
    .set({ role: toSet })
    .where(eq(users.id, id))
    .returning();
  if (!raw) {
    throw new HTTPException(404, { message: `User ${id} not found` });
  }

  return userSchema.parse(raw);
}

export async function findUsers(): Promise<Array<User>> {
  const { db } = getContext<HonoEnv>().var;

  return (await db.select().from(users)).map((raw) => userSchema.parse(raw));
}

export const rootUserChatId = 0;
