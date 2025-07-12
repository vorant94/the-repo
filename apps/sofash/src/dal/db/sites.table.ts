import { HTTPException } from "hono/http-exception";
import { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { v5 } from "uuid";
import { z } from "zod";
import { getContext } from "../../shared/context/context.ts";
import { createLogger } from "../../shared/logger/logger.ts";
import { uuidNamespace } from "../../shared/schema/db-extra.ts";
import {
  type InsertSite,
  insertSiteSchema,
  type Site,
  type SiteName,
  siteSchema,
  sites,
} from "../../shared/schema/sites.ts";

export function insertSite(
  toInsertRaw: InsertSite,
): ResultAsync<Site, HTTPException> {
  using logger = createLogger("insertSite");
  const { db } = getContext();

  const toInsert = ntParseWithZod(toInsertRaw, insertSiteSchema).mapErr(
    (err) =>
      new HTTPException(400, {
        message: "Failed validation of site to insert",
        cause: err,
      }),
  );

  const insertedRaw = toInsert.asyncAndThen((toInsert) =>
    ResultAsync.fromPromise(
      db
        .insert(sites)
        .values({
          id: generateSiteId(toInsert.chainId, toInsert.name),
          ...toInsert,
        })
        .returning(),
      (err) => {
        // libsql and d1 errors are of different structure, rawdog parsing the
        // error message is the only common denominator i found
        if (
          err instanceof Error &&
          err.message.includes("UNIQUE constraint failed: sites.id")
        ) {
          return new HTTPException(409, {
            message: `Site with chain id [${toInsert.chainId}] and name [${toInsert.name}] already exists`,
            cause: err,
          });
        }

        if (
          err instanceof Error &&
          err.message.includes("FOREIGN KEY constraint failed")
        ) {
          return new HTTPException(400, {
            message: `Chain with id [${toInsert.chainId}] that site is being associated with doesn't exist`,
            cause: err,
          });
        }

        logger.error("Unexpected error while inserting a site", err);
        return new HTTPException(500, {
          message: "Unexpected error while inserting a site",
          cause: err,
        });
      },
    ),
  );

  return insertedRaw.andThen(([upsertedRaw]) =>
    ntParseWithZod(upsertedRaw, siteSchema).mapErr(
      (err) =>
        new HTTPException(500, {
          message:
            "Failed to validate insertion result after site was inserted",
          cause: err,
        }),
    ),
  );
}

export function selectSites(): ResultAsync<Array<Site>, HTTPException> {
  const { db } = getContext();

  const rawSites = ResultAsync.fromPromise(
    db.select().from(sites),
    (err) =>
      new HTTPException(500, {
        message: "Failed to retrieve sites from db",
        cause: err,
      }),
  );

  return rawSites.andThen((rawSites) =>
    ntParseWithZod(rawSites, z.array(siteSchema)).mapErr(
      (err) =>
        new HTTPException(500, {
          message: "Failed to validate retrieved from db sites",
          cause: err,
        }),
    ),
  );
}

export function generateSiteId(chainId: string, siteName: SiteName): string {
  return v5(`${chainId}${siteName}`, uuidNamespace);
}
