import { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import { type Title, titleSchema, titles } from "../../shared/schema/titles.ts";

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
