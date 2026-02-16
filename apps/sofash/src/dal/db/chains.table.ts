import { eq } from "drizzle-orm";
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
  type RawChain,
} from "../../shared/schema/chains.ts";
import { uuidNamespace } from "../../shared/schema/db-extra.ts";

export async function insertChain(toInsertRaw: InsertChain): Promise<Chain> {
  const { db } = getContext();

  const toInsertResult = insertChainSchema.safeParse(toInsertRaw);
  if (!toInsertResult.success) {
    throw new BadInputException("Failed validation of chain to insert", {
      cause: toInsertResult.error,
    });
  }

  const toInsert = toInsertResult.data;

  let insertedRaw: Array<RawChain>;
  try {
    insertedRaw = await db
      .insert(chains)
      .values({
        id: generateChainId(toInsert.name),
        ...toInsert,
      })
      .returning();
  } catch (err) {
    using logger = createLogger("insertChain::err");

    // libsql and d1 errors are of different structure, rawdog parsing the
    // error message is the only common denominator i found
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed: chains.name")
    ) {
      throw new BadInputException(
        `Chain with name [${toInsert.name}] already exists`,
        { cause: err },
      );
    }

    logger.error("Unexpected error while inserting a chain", err);
    throw new UnexpectedBranchException(
      "Unexpected error while inserting a chain",
      { cause: err },
    );
  }

  const insertedResult = chainSchema.safeParse(insertedRaw[0]);
  if (!insertedResult.success) {
    throw new BadOutputException(
      "Failed to validate insertion result after chain was inserted",
      { cause: insertedResult.error },
    );
  }

  return insertedResult.data;
}

export async function selectChains(): Promise<Array<Chain>> {
  const { db } = getContext();

  let rawChains: Array<RawChain>;
  try {
    rawChains = await db.select().from(chains);
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to retrieve chains from db", {
      cause,
    });
  }

  const chainsResult = z.array(chainSchema).safeParse(rawChains);
  if (!chainsResult.success) {
    throw new BadOutputException(
      "Failed to validate retrieved from db chains",
      {
        cause: chainsResult.error,
      },
    );
  }

  return chainsResult.data;
}

export function generateChainId(chainName: string): string {
  return v5(chainName, uuidNamespace);
}

export async function getChainById(id: string): Promise<Chain> {
  const { db } = getContext();

  let rawChains: Array<RawChain>;
  try {
    rawChains = await db.select().from(chains).where(eq(chains.id, id));
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to retrieve chains from db", {
      cause,
    });
  }

  if (rawChains.length === 0) {
    throw new NotFoundException(`Chain with id [${id}] not found`);
  }

  const chainResult = chainSchema.safeParse(rawChains[0]);
  if (!chainResult.success) {
    throw new BadOutputException("Failed to validate retrieved from db chain", {
      cause: chainResult.error,
    });
  }

  return chainResult.data;
}
