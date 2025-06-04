import { eq } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { v5 } from "uuid";
import { createConflictUpdateColumns } from "../../shared/drizzle/create-conflict-update-columns.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { uuidNamespace } from "../../shared/schema/db-extra.ts";
import {
  type UpsertUser,
  type User,
  type UserRole,
  upsertUserSchema,
  userRoleSchema,
  userSchema,
  users,
} from "../../shared/schema/users.ts";

export async function upsertUser(toUpsertRaw: UpsertUser): Promise<User> {
  const { db } = getContext<HonoEnv>().var;

  const toUpsert = upsertUserSchema.parse(toUpsertRaw);

  const [upserted] = await db
    .insert(users)
    .values({
      id: v5(toUpsertRaw.telegramChatId.toString(), uuidNamespace),
      ...toUpsert,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: createConflictUpdateColumns(users, ["role", "updatedAt"]),
    })
    .returning();

  return userSchema.parse(upserted);
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
