import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { v5 } from "uuid";
import { getContext } from "../../shared/context/context.ts";
import { createConflictUpdateColumns } from "../../shared/drizzle/create-conflict-update-columns.ts";
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
  const { db } = getContext();

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
  const { db } = getContext();

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
  const { db } = getContext();

  return (await db.select().from(users)).map((raw) => userSchema.parse(raw));
}

export const rootUserChatId = 0;
