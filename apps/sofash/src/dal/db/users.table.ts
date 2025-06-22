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

  const toUpsert = upsertUserSchema.safeParse(toUpsertRaw);
  if (!toUpsert.success) {
    throw new HTTPException(400, { cause: toUpsert.error });
  }

  const [upserted] = await db
    .insert(users)
    .values({
      id: v5(toUpsertRaw.telegramChatId.toString(), uuidNamespace),
      ...toUpsert.data,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: createConflictUpdateColumns(users, ["role", "updatedAt"]),
    })
    .returning();

  const parsed = userSchema.safeParse(upserted);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: parsed.error });
  }

  return parsed.data;
}

export async function setUserRole(
  id: User["id"],
  toSetRaw: UserRole,
): Promise<User> {
  const { db } = getContext();

  const toSet = userRoleSchema.safeParse(toSetRaw);
  if (!toSet.success) {
    throw new HTTPException(400, { cause: toSet.error });
  }

  const [raw] = await db
    .update(users)
    .set({ role: toSet.data })
    .where(eq(users.id, id))
    .returning();
  if (!raw) {
    throw new HTTPException(404, { message: `User ${id} not found` });
  }

  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    throw new HTTPException(500, { cause: parsed.error });
  }

  return parsed.data;
}

export async function findUsers(): Promise<Array<User>> {
  const { db } = getContext();

  const parsed = (await db.select().from(users)).map((raw) =>
    userSchema.safeParse(raw),
  );
  const { success, failed } = Object.groupBy(parsed, (p) =>
    p.success ? "success" : "failed",
  );
  if (failed?.length) {
    throw new HTTPException(500, { cause: failed.map((p) => p.error) });
  }

  return (success ?? []).map((p) => p.data as User);
}

export const rootUserChatId = 0;
