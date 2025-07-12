import { ok, type ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { generateChainId } from "../dal/db/chains.table.ts";
import { getSiteById, insertSite } from "../dal/db/sites.table.ts";
import { BadInputException } from "../shared/exceptions/bad-input.exception.ts";
import type { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
import type { NotFoundException } from "../shared/exceptions/not-found.exception.ts";
import type { UnexpectedBranchException } from "../shared/exceptions/unexpected-branch.exception.ts";
import type { ChainName } from "../shared/schema/chains.ts";
import {
  planetSiteNameSchema,
  ravHenSiteNameSchema,
  type Site,
  type SiteName,
} from "../shared/schema/sites.ts";

export function createSite({
  chainName,
  name,
}: CreateSite): ResultAsync<
  Site,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  const chainId = generateChainId(chainName);

  const chainAssociationValidated = ntParseWithZod(
    name,
    // TODO create a dedicated map of chain name to site name schema
    chainName === "rav-hen" ? ravHenSiteNameSchema : planetSiteNameSchema,
  ).mapErr(
    (err) =>
      new BadInputException(
        `Site with name [${name}] isn't associated with chain with name [${chainName}]`,
        { cause: err },
      ),
  );

  return chainAssociationValidated.asyncAndThen(() =>
    insertSite({ name, chainId }),
  );
}

export interface CreateSite {
  name: SiteName;
  chainName: ChainName;
}

export function scrapSite({
  id,
  date,
}: ScrapSite): ResultAsync<
  string,
  UnexpectedBranchException | BadOutputException | NotFoundException
> {
  const site = getSiteById(id);

  return site.andThen(() => ok(`success ${date}`));
}

export interface ScrapSite {
  id: string;
  date: Date;
}
