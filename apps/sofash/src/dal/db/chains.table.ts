import { eq } from "drizzle-orm";
import { err, ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { v5 } from "uuid";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { NotFoundException } from "../../shared/exceptions/not-found.exception.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type Chain,
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
        using logger = createLogger("insertChain::toInsert.asyncAndThen::err");

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

export function generateChainId(chainName: string): string {
  return v5(chainName, uuidNamespace);
}

export function getChainById(
  id: string,
): ResultAsync<
  Chain,
  UnexpectedBranchException | BadOutputException | NotFoundException
> {
  const { db } = getContext();

  const rawChains = ResultAsync.fromPromise(
    db.select().from(chains).where(eq(chains.id, id)),
    (err) =>
      new UnexpectedBranchException("Failed to retrieve chains from db", {
        cause: err,
      }),
  );

  return rawChains.andThen((rawSites) => {
    if (rawSites.length === 0) {
      return err(new NotFoundException(`Chain with id [${id}] not found`));
    }

    return ntParseWithZod(rawSites[0], chainSchema).mapErr(
      (err) =>
        new BadOutputException("Failed to validate retrieved from db chain", {
          cause: err,
        }),
    );
  });
}
