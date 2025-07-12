import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
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
  type User,
  type UserRole,
  userRoleSchema,
  userSchema,
  users,
} from "../../shared/schema/users.ts";

export function upsertUserByTelegramChatId(
  toUpsertRaw: InsertUser,
): ResultAsync<
  User,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  using logger = createLogger("upsertUserByTelegramChatId");
  const { db } = getContext();

  const toUpsert = ntParseWithZod(toUpsertRaw, insertUserSchema).mapErr(
    (err) =>
      new BadInputException("Failed validation of user to upsert", {
        cause: err,
      }),
  );

  const upsertedRaw = toUpsert.asyncAndThen((toUpsert) =>
    ResultAsync.fromPromise(
      db
        .insert(users)
        .values({
          id: generateUserId(toUpsert.telegramChatId),
          ...toUpsert,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: createConflictUpdateColumns(users, ["role", "updatedAt"]),
        })
        .returning(),
      (err) => {
        logger.error("Unexpected error while upserting a user", err);
        return new UnexpectedBranchException(
          "Unexpected error while inserting a site",
          { cause: err },
        );
      },
    ),
  );

  return upsertedRaw.andThen(([upsertedRaw]) =>
    ntParseWithZod(upsertedRaw, userSchema).mapErr(
      (err) =>
        new BadOutputException(
          "Failed to validate upsert result after user upsert",
          { cause: err },
        ),
    ),
  );
}

export function setUserRole(
  id: User["id"],
  toSetRaw: UserRole,
): ResultAsync<
  User,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  using logger = createLogger("setUserRole");
  const { db } = getContext();

  const toSet = ntParseWithZod(toSetRaw, userRoleSchema).mapErr(
    (err) =>
      new BadInputException("Failed validation of user role to set", {
        cause: err,
      }),
  );

  const setRaw = toSet.asyncAndThen((toSet) =>
    ResultAsync.fromPromise(
      db.update(users).set({ role: toSet }).where(eq(users.id, id)).returning(),
      (err) => {
        logger.error("Unexpected error while setting role to user", err);
        return new UnexpectedBranchException(
          "Unexpected error while setting role to user",
          { cause: err },
        );
      },
    ),
  );

  return setRaw.andThen(([setRaw]) =>
    ntParseWithZod(setRaw, userSchema).mapErr(
      (err) =>
        new BadOutputException(
          "Failed to validate set result after user role was set",
          { cause: err },
        ),
    ),
  );
}

export function selectUsers(): ResultAsync<
  Array<User>,
  UnexpectedBranchException | BadOutputException
> {
  const { db } = getContext();

  const rawUsers = ResultAsync.fromPromise(
    db.select().from(users),
    (err) =>
      new UnexpectedBranchException("Failed to retrieve users from db", {
        cause: err,
      }),
  );

  return rawUsers.andThen((rawUsers) =>
    ntParseWithZod(rawUsers, z.array(userSchema)).mapErr(
      (err) =>
        new BadOutputException("Failed to validate retrieved from db users", {
          cause: err,
        }),
    ),
  );
}

export const rootUserChatId = 0;

export function generateUserId(telegramChatId: number): string {
  return v5(telegramChatId.toString(), uuidNamespace);
}
