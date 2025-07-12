import { ResultAsync } from "neverthrow";
import { generateChainId, getChainById } from "../dal/db/chains.table.ts";
import { getSiteById, insertSite } from "../dal/db/sites.table.ts";
import { findQuickbookFilmEvents } from "../dal/quickbook/quickbook.client.ts";
import type { BadInputException } from "../shared/exceptions/bad-input.exception.ts";
import type { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
import type { NotFoundException } from "../shared/exceptions/not-found.exception.ts";
import type { UnexpectedBranchException } from "../shared/exceptions/unexpected-branch.exception.ts";
import type { Site } from "../shared/schema/sites.ts";
import {
  chainNameToQuickbookChainId,
  chainNameToSiteNameToQuickbookSiteId,
} from "./scrapper/name-to-external-id-mappings.ts";
import { validateChainToSiteAssociation } from "./scrapper/validate-chain-to-site-association.ts";

export function createSite({
  chainName,
  name,
  ...rest
}: CreateSite): ResultAsync<
  Site,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  const chainId = generateChainId(chainName);

  const associationValidated = validateChainToSiteAssociation(chainName, name);

  return associationValidated.asyncAndThen(() =>
    insertSite({ name, chainId, ...rest }),
  );
}

export interface CreateSite {
  name: string;
  chainName: string;
  externalId: string;
}

export function scrapSite({
  id,
  date,
}: ScrapSite): ResultAsync<
  object,
  UnexpectedBranchException | BadOutputException | NotFoundException
> {
  const site = getSiteById(id);
  const chain = site.andThen((site) => getChainById(site.chainId));

  const associationValidated = ResultAsync.combine([chain, site]).andThen(
    ([chain, site]) => validateChainToSiteAssociation(chain.name, site.name),
  );

  return associationValidated.andThen(([chainName, siteName]) =>
    findQuickbookFilmEvents(
      chainNameToQuickbookChainId[chainName],
      // @ts-ignore fuck it, i don't want to go too deep into these TS shenanigans
      chainNameToSiteNameToQuickbookSiteId[chainName][siteName],
      date,
    ),
  );
}

export interface ScrapSite {
  id: string;
  date: Date;
}
