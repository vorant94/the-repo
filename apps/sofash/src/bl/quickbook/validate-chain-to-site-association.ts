import { BadInputException } from "../../shared/exceptions/bad-input.exception";
import {
  type ChainName,
  chainNameSchema,
  chainNames,
  planetSiteNameSchema,
  ravHenSiteNameSchema,
  type SiteName,
  siteNameSchema,
  siteNames,
} from "./name-to-external-id-mappings.ts";

export function validateChainToSiteAssociation(
  chainName: string,
  siteName: string,
): [ChainName, SiteName] {
  const chainNameResult = chainNameSchema.safeParse(chainName);
  if (!chainNameResult.success) {
    throw new BadInputException(
      `Allowed chain names are: [${chainNames.join()}]`,
      {
        cause: chainNameResult.error,
      },
    );
  }

  const siteNameResult = siteNameSchema.safeParse(siteName);
  if (!siteNameResult.success) {
    throw new BadInputException(
      `Allowed site names are: [${siteNames.join()}]`,
      {
        cause: siteNameResult.error,
      },
    );
  }

  const chainNameValidated = chainNameResult.data;
  const siteNameValidated = siteNameResult.data;

  // TODO create a dedicated map of chain name to site name schema
  const siteSchema =
    chainNameValidated === "rav-hen"
      ? ravHenSiteNameSchema
      : planetSiteNameSchema;
  const associationResult = siteSchema.safeParse(siteNameValidated);
  if (!associationResult.success) {
    throw new BadInputException(
      `Site with name [${siteNameValidated}] isn't associated with chain with name [${chainNameValidated}]`,
      { cause: associationResult.error },
    );
  }

  return [chainNameValidated, siteNameValidated];
}
