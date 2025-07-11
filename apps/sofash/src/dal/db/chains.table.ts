import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { v5 } from "uuid";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
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
): ResultAsync<Chain, HTTPException> {
  using logger = createLogger("insertChain");
  const { db } = getContext();

  const toInsert = ntParseWithZod(toInsertRaw, insertChainSchema).mapErr(
    (err) =>
      new HTTPException(400, {
        message: "Failed validation of chain to insert",
        cause: err,
      }),
  );

  const insertedRaw = toInsert.asyncAndThen((toInsert) =>
    ResultAsync.fromPromise(
      db
        .insert(chains)
        .values({
          id: v5(toInsert.name, uuidNamespace),
          ...toInsert,
        })
        .returning(),
      (err) => {
        // libsql and d1 errors are of different structure, rawdog parsing the
        // error message is the only common denominator i found
        if (
          err instanceof Error &&
          err.message.includes("UNIQUE constraint failed: chains.id")
        ) {
          return new HTTPException(409, {
            message: `Chain with name [${toInsert.name}] already exists`,
            cause: err,
          });
        }

        logger.error("Unexpected error while inserting a chain", err);
        return new HTTPException(500, {
          message: "Unexpected error while inserting a chain",
          cause: err,
        });
      },
    ),
  );

  return insertedRaw.andThen(([upsertedRaw]) =>
    ntParseWithZod(upsertedRaw, chainSchema).mapErr(
      (err) =>
        new HTTPException(500, {
          message:
            "Failed to validate insertion result after chain was inserted",
          cause: err,
        }),
    ),
  );
}

export function selectChains(): ResultAsync<Array<Chain>, HTTPException> {
  const { db } = getContext();

  const rawChains = ResultAsync.fromPromise(
    db.select().from(chains),
    (err) =>
      new HTTPException(500, {
        message: "Failed to retrieve chains from db",
        cause: err,
      }),
  );

  return rawChains.andThen((rawChains) =>
    ntParseWithZod(rawChains, z.array(chainSchema)).mapErr(
      (err) =>
        new HTTPException(500, {
          message: "Failed to validate retrieved from db chains",
          cause: err,
        }),
    ),
  );
}
