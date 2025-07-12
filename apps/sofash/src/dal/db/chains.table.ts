import { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { v5 } from "uuid";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type Chain,
  type ChainName,
  chainSchema,
  chains,
  type InsertChain,
  insertChainSchema,
} from "../../shared/schema/chains.ts";
import { uuidNamespace } from "../../shared/schema/db-extra.ts";

export function insertChain(
  toInsertRaw: InsertChain,
): ResultAsync<
  Chain,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  using logger = createLogger("insertChain");
  const { db } = getContext();

  const toInsert = ntParseWithZod(toInsertRaw, insertChainSchema).mapErr(
    (err) =>
      new BadInputException("Failed validation of chain to insert", {
        cause: err,
      }),
  );

  const insertedRaw = toInsert.asyncAndThen((toInsert) =>
    ResultAsync.fromPromise(
      db
        .insert(chains)
        .values({
          id: generateChainId(toInsert.name),
          ...toInsert,
        })
        .returning(),
      (err) => {
        // libsql and d1 errors are of different structure, rawdog parsing the
        // error message is the only common denominator i found
        if (
          err instanceof Error &&
          err.message.includes("UNIQUE constraint failed: chains.name")
        ) {
          return new BadInputException(
            `Chain with name [${toInsert.name}] already exists`,
            { cause: err },
          );
        }

        logger.error("Unexpected error while inserting a chain", err);
        return new UnexpectedBranchException(
          "Unexpected error while inserting a chain",
          { cause: err },
        );
      },
    ),
  );

  return insertedRaw.andThen(([upsertedRaw]) =>
    ntParseWithZod(upsertedRaw, chainSchema).mapErr(
      (err) =>
        new BadOutputException(
          "Failed to validate insertion result after chain was inserted",
          { cause: err },
        ),
    ),
  );
}

export function selectChains(): ResultAsync<
  Array<Chain>,
  UnexpectedBranchException | BadOutputException
> {
  const { db } = getContext();

  const rawChains = ResultAsync.fromPromise(
    db.select().from(chains),
    (err) =>
      new UnexpectedBranchException("Failed to retrieve chains from db", {
        cause: err,
      }),
  );

  return rawChains.andThen((rawChains) =>
    ntParseWithZod(rawChains, z.array(chainSchema)).mapErr(
      (err) =>
        new BadOutputException("Failed to validate retrieved from db chains", {
          cause: err,
        }),
    ),
  );
}

export function generateChainId(chainName: ChainName): string {
  return v5(chainName, uuidNamespace);
}
