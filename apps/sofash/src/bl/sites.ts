import type { ResultAsync } from "neverthrow";
import { generateChainId } from "../dal/db/chains.table.ts";
import { insertSite } from "../dal/db/sites.table.ts";
import type { BadInputException } from "../shared/exceptions/bad-input.exception.ts";
import type { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
import type { UnexpectedBranchException } from "../shared/exceptions/unexpected-branch.exception.ts";
import type { Site } from "../shared/schema/sites.ts";
import { validateChainToSiteAssociation } from "./quickbook/validate-chain-to-site-association.ts";

export function createSite({
  chainName,
  name,
  ...rest
}: CreateSiteParams): ResultAsync<
  Site,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  const chainId = generateChainId(chainName);

  const associationValidated = validateChainToSiteAssociation(chainName, name);

  return associationValidated.asyncAndThen(() =>
    insertSite({ name, chainId, ...rest }),
  );
}

export interface CreateSiteParams {
  name: string;
  chainName: string;
  externalId: string;
}
