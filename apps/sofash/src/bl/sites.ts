import { generateChainId } from "../dal/db/chains.table.ts";
import { insertSite } from "../dal/db/sites.table.ts";
import type { Site } from "../shared/schema/sites.ts";
import { validateChainToSiteAssociation } from "./quickbook/validate-chain-to-site-association.ts";

export async function createSite({
  chainName,
  name,
  ...rest
}: CreateSiteParams): Promise<Site> {
  const chainId = generateChainId(chainName);

  validateChainToSiteAssociation(chainName, name);

  return await insertSite({ name, chainId, ...rest });
}

export interface CreateSiteParams {
  name: string;
  chainName: string;
  externalId: string;
}
