import { format } from "date-fns";
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
  type RawTitle,
  type Title,
  titleSchema,
  titles,
} from "../../shared/schema/titles.ts";

export async function upsertTitle(toUpsertRaw: InsertTitle): Promise<Title> {
  const { db } = getContext();

  const toUpsertResult = insertTitleSchema.safeParse(toUpsertRaw);
  if (!toUpsertResult.success) {
    throw new BadInputException("Failed validation of title to upsert", {
      cause: toUpsertResult.error,
    });
  }

  const { releasedAt, ...rest } = toUpsertResult.data;

  let upsertedRaw: Array<RawTitle>;
  try {
    upsertedRaw = await db
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
      .returning();
  } catch (err) {
    using logger = createLogger("upsertTitle::err");

    logger.error("Unexpected error while upserting a title", err);
    throw new UnexpectedBranchException(
      "Unexpected error while inserting a title",
      { cause: err },
    );
  }

  const upsertedResult = titleSchema.safeParse(upsertedRaw[0]);
  if (!upsertedResult.success) {
    throw new BadOutputException(
      "Failed to validate upsert result after title upsert",
      { cause: upsertedResult.error },
    );
  }

  return upsertedResult.data;
}

export async function selectTitles(): Promise<Array<Title>> {
  const { db } = getContext();

  let rawTitles: Array<RawTitle>;
  try {
    rawTitles = await db.select().from(titles);
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to retrieve titles from db", {
      cause,
    });
  }

  const titlesResult = z.array(titleSchema).safeParse(rawTitles);
  if (!titlesResult.success) {
    throw new BadOutputException(
      "Failed to validate retrieved from db titles",
      {
        cause: titlesResult.error,
      },
    );
  }

  return titlesResult.data;
}

function generateTitleId(name: string, releasedAt: Date): string {
  return v5(`${name}${releasedAt.getFullYear()}`, uuidNamespace);
}
