import { eq } from "drizzle-orm";
import { v5 } from "uuid";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
import { createConflictUpdateColumns } from "../../shared/drizzle/create-conflict-update-columns.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import { uuidNamespace } from "../../shared/schema/db-extra.ts";
import {
  type InsertUser,
  insertUserSchema,
  type RawUser,
  type User,
  type UserRole,
  userRoleSchema,
  userSchema,
  users,
} from "../../shared/schema/users.ts";

export async function upsertUserByTelegramChatId(
  toUpsertRaw: InsertUser,
): Promise<User> {
  const { db } = getContext();

  const toUpsertResult = insertUserSchema.safeParse(toUpsertRaw);
  if (!toUpsertResult.success) {
    throw new BadInputException("Failed validation of user to upsert", {
      cause: toUpsertResult.error,
    });
  }

  const toUpsert = toUpsertResult.data;

  let upsertedRaw: Array<RawUser>;
  try {
    upsertedRaw = await db
      .insert(users)
      .values({
        id: generateUserId(toUpsert.telegramChatId),
        ...toUpsert,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: createConflictUpdateColumns(users, ["role", "updatedAt"]),
      })
      .returning();
  } catch (err) {
    using logger = createLogger("upsertUserByTelegramChatId::err");

    logger.error("Unexpected error while upserting a user", err);
    throw new UnexpectedBranchException(
      "Unexpected error while inserting a user",
      { cause: err },
    );
  }

  const upsertedResult = userSchema.safeParse(upsertedRaw[0]);
  if (!upsertedResult.success) {
    throw new BadOutputException(
      "Failed to validate upsert result after user upsert",
      { cause: upsertedResult.error },
    );
  }

  return upsertedResult.data;
}

export async function setUserRole(
  id: User["id"],
  toSetRaw: UserRole,
): Promise<User> {
  const { db } = getContext();

  const toSetResult = userRoleSchema.safeParse(toSetRaw);
  if (!toSetResult.success) {
    throw new BadInputException("Failed validation of user role to set", {
      cause: toSetResult.error,
    });
  }

  const toSet = toSetResult.data;

  let setRaw: Array<RawUser>;
  try {
    setRaw = await db
      .update(users)
      .set({ role: toSet })
      .where(eq(users.id, id))
      .returning();
  } catch (err) {
    using logger = createLogger("setUserRole::err");

    logger.error("Unexpected error while setting role to user", err);
    throw new UnexpectedBranchException(
      "Unexpected error while setting role to user",
      { cause: err },
    );
  }

  const setResult = userSchema.safeParse(setRaw[0]);
  if (!setResult.success) {
    throw new BadOutputException(
      "Failed to validate set result after user role was set",
      { cause: setResult.error },
    );
  }

  return setResult.data;
}

export async function selectUsers(): Promise<Array<User>> {
  const { db } = getContext();

  let rawUsers: Array<RawUser>;
  try {
    rawUsers = await db.select().from(users);
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to retrieve users from db", {
      cause,
    });
  }

  const usersResult = z.array(userSchema).safeParse(rawUsers);
  if (!usersResult.success) {
    throw new BadOutputException("Failed to validate retrieved from db users", {
      cause: usersResult.error,
    });
  }

  return usersResult.data;
}

export const rootUserChatId = 0;

function generateUserId(telegramChatId: number): string {
  return v5(telegramChatId.toString(), uuidNamespace);
}
