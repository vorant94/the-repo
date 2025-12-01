import { format } from "date-fns";
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
import {
  sqliteDatetimeFormat,
  uuidNamespace,
} from "../../shared/schema/db-extra.ts";
import {
  type InsertTitle,
  insertTitleSchema,
  type Title,
  titleSchema,
  titles,
} from "../../shared/schema/titles.ts";

export function upsertTitle(
  toUpsertRaw: InsertTitle,
): ResultAsync<
  Title,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  const { db } = getContext();

  const toUpsert = ntParseWithZod(toUpsertRaw, insertTitleSchema).mapErr(
    (err) =>
      new BadInputException("Failed validation of title to upsert", {
        cause: err,
      }),
  );

  const upsertedRaw = toUpsert.asyncAndThen(({ releasedAt, ...rest }) =>
    ResultAsync.fromPromise(
      db
        .insert(titles)
        .values({
          id: generateTitleId(rest.name, releasedAt),
          releasedAt: format(releasedAt, sqliteDatetimeFormat),
          ...rest,
        })
        .onConflictDoUpdate({
          target: titles.id,
          set: createConflictUpdateColumns(titles, ["updatedAt"]),
        })
        .returning(),
      (err) => {
        using logger = createLogger("upsertTitle::toUpsert.asyncAndThen::err");

        logger.error("Unexpected error while upserting a title", err);
        return new UnexpectedBranchException(
          "Unexpected error while inserting a title",
          { cause: err },
        );
      },
    ),
  );

  return upsertedRaw.andThen(([upsertedRaw]) =>
    ntParseWithZod(upsertedRaw, titleSchema).mapErr(
      (err) =>
        new BadOutputException(
          "Failed to validate upsert result after title upsert",
          { cause: err },
        ),
    ),
  );
}

export function selectTitles(): ResultAsync<
  Array<Title>,
  UnexpectedBranchException | BadOutputException
> {
  const { db } = getContext();

  const rawTitles = ResultAsync.fromPromise(
    db.select().from(titles),
    (err) =>
      new UnexpectedBranchException("Failed to retrieve titles from db", {
        cause: err,
      }),
  );

  return rawTitles.andThen((rawSites) =>
    ntParseWithZod(rawSites, z.array(titleSchema)).mapErr(
      (err) =>
        new BadOutputException("Failed to validate retrieved from db titles", {
          cause: err,
        }),
    ),
  );
}

function generateTitleId(name: string, releasedAt: Date): string {
  return v5(`${name}${releasedAt.getFullYear()}`, uuidNamespace);
}
