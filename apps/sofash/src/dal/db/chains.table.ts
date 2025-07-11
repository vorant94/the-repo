import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { v5 } from "uuid";
import { getContext } from "../../shared/context/context.ts";
import { isErrorWithCode } from "../../shared/errors/error-with-code.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import {
  type Chain,
  chainSchema,
  chains,
  type InsertChain,
  insertChainSchema,
} from "../../shared/schema/chains.ts";
import {
  constraintPrimaryKeyErrorCode,
  uuidNamespace,
} from "../../shared/schema/db-extra.ts";

export function insertChain(
  toInsertRaw: InsertChain,
): ResultAsync<Chain, HTTPException> {
  const logger = createLogger("insertChain");
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
        if (
          isErrorWithCode(err) &&
          err.code === constraintPrimaryKeyErrorCode
        ) {
          return new HTTPException(409, {
            message: `Chain with name [${toInsert.name}] already exists`,
            cause: err,
          });
        }

        logger.debug("unknown error", err);
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
