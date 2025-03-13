import type { HonoEnv } from "@/shared/env/hono-env.ts";
import {
  type CreateUser,
  type User,
  type UserRole,
  createUserSchema,
  userRoleSchema,
  userSchema,
  users,
} from "@/shared/schema/users.ts";
import { eq } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";

export async function createUser(toCreateRaw: CreateUser): Promise<User> {
  const { db } = getContext<HonoEnv>().var;

  const toCreate = createUserSchema.parse(toCreateRaw);

  return userSchema.parse(
    await db
      .insert(users)
      .values({ ...toCreate })
      .returning(),
  );
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
