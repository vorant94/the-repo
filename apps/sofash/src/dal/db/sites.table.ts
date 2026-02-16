import { eq } from "drizzle-orm";
import { v5 } from "uuid";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
import { NotFoundException } from "../../shared/exceptions/not-found.exception.ts";
import { UnexpectedBranchException } from "../../shared/exceptions/unexpected-branch.exception.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import { uuidNamespace } from "../../shared/schema/db-extra.ts";
import {
  type InsertSite,
  insertSiteSchema,
  type RawSite,
  type Site,
  siteSchema,
  sites,
} from "../../shared/schema/sites.ts";

export async function insertSite(toInsertRaw: InsertSite): Promise<Site> {
  const { db } = getContext();

  const toInsertResult = insertSiteSchema.safeParse(toInsertRaw);
  if (!toInsertResult.success) {
    throw new BadInputException("Failed validation of site to insert", {
      cause: toInsertResult.error,
    });
  }

  const toInsert = toInsertResult.data;

  let insertedRaw: Array<RawSite>;
  try {
    insertedRaw = await db
      .insert(sites)
      .values({
        id: generateSiteId(toInsert.chainId, toInsert.externalId),
        ...toInsert,
      })
      .returning();
  } catch (err) {
    using logger = createLogger("insertSite::err");

    // libsql and d1 errors are of different structure, rawdog parsing the
    // error message is the only common denominator i found
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed: sites.name")
    ) {
      throw new BadInputException(
        `Site with chain id [${toInsert.chainId}] and name [${toInsert.name}] already exists`,
        { cause: err },
      );
    }

    if (
      err instanceof Error &&
      err.cause instanceof Error &&
      err.cause.message.includes("FOREIGN KEY constraint failed")
    ) {
      throw new BadInputException(
        `Chain with id [${toInsert.chainId}] you want to associate site with doesn't exist`,
        { cause: err.cause },
      );
    }

    if (
      err instanceof Error &&
      err.message.includes("FOREIGN KEY constraint failed")
    ) {
      throw new BadInputException(
        `Chain with id [${toInsert.chainId}] that site is being associated with doesn't exist`,
        { cause: err },
      );
    }

    logger.error("Unexpected error while inserting a site", err);
    throw new UnexpectedBranchException(
      "Unexpected error while inserting a site",
      { cause: err },
    );
  }

  const insertedResult = siteSchema.safeParse(insertedRaw[0]);
  if (!insertedResult.success) {
    throw new BadOutputException(
      "Failed to validate insertion result after site was inserted",
      { cause: insertedResult.error },
    );
  }

  return insertedResult.data;
}

export async function selectSites(): Promise<Array<Site>> {
  const { db } = getContext();

  let rawSites: Array<RawSite>;
  try {
    rawSites = await db.select().from(sites);
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to retrieve sites from db", {
      cause,
    });
  }

  const sitesResult = z.array(siteSchema).safeParse(rawSites);
  if (!sitesResult.success) {
    throw new BadOutputException("Failed to validate retrieved from db sites", {
      cause: sitesResult.error,
    });
  }

  return sitesResult.data;
}

export async function getSiteById(id: string): Promise<Site> {
  const { db } = getContext();

  let rawSites: Array<RawSite>;
  try {
    rawSites = await db.select().from(sites).where(eq(sites.id, id));
  } catch (cause) {
    throw new UnexpectedBranchException("Failed to retrieve sites from db", {
      cause,
    });
  }

  if (rawSites.length === 0) {
    throw new NotFoundException(`Site with id [${id}] not found`);
  }

  const siteResult = siteSchema.safeParse(rawSites[0]);
  if (!siteResult.success) {
    throw new BadOutputException("Failed to validate retrieved from db site", {
      cause: siteResult.error,
    });
  }

  return siteResult.data;
}

function generateSiteId(chainId: string, siteExternalId: string): string {
  return v5(`${chainId}${siteExternalId}`, uuidNamespace);
}
