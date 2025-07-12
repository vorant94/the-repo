import type { ResultAsync } from "neverthrow";
import { ntParseWithZod } from "nt";
import { generateChainId } from "../dal/db/chains.table.ts";
import { insertSite } from "../dal/db/sites.table.ts";
import { BadInputException } from "../shared/exceptions/bad-input.exception.ts";
import type { BadOutputException } from "../shared/exceptions/bad-output.exception.ts";
import type { UnexpectedBranchException } from "../shared/exceptions/unexpected-branch.exception.ts";
import type { ChainName } from "../shared/schema/chains.ts";
import {
  planetSiteNameSchema,
  ravHenSiteNameSchema,
  type Site,
  type SiteName,
} from "../shared/schema/sites.ts";

export function createSite(
  toCreate: CreateSite,
): ResultAsync<
  Site,
  BadInputException | BadOutputException | UnexpectedBranchException
> {
  const chainId = generateChainId(toCreate.chainName);

  const chainAssociationValidated = ntParseWithZod(
    toCreate.name,
    // TODO create a dedicated map of chain name to site name schema
    toCreate.chainName === "rav-hen"
      ? ravHenSiteNameSchema
      : planetSiteNameSchema,
  ).mapErr(
    (err) =>
      new BadInputException(
        `Site with name [${toCreate.name}] isn't associated with chain with name [${toCreate.chainName}]`,
        { cause: err },
      ),
  );

  return chainAssociationValidated.asyncAndThen(() =>
    insertSite({ name: toCreate.name, chainId }),
  );
}

export interface CreateSite {
  name: SiteName;
  chainName: ChainName;
}
