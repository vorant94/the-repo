import { Result } from "neverthrow";
import { ntParseWithZod } from "nt";
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
): Result<[ChainName, SiteName], BadInputException> {
  const chainNameValidated = ntParseWithZod(chainName, chainNameSchema).mapErr(
    (err) =>
      new BadInputException(`Allowed chain names are: [${chainNames.join()}]`, {
        cause: err,
      }),
  );

  const siteNameValidated = ntParseWithZod(siteName, siteNameSchema).mapErr(
    (err) =>
      new BadInputException(`Allowed site names are: [${siteNames.join()}]`, {
        cause: err,
      }),
  );

  return Result.combine([chainNameValidated, siteNameValidated]).andThrough(
    ([chainName, siteName]) =>
      ntParseWithZod(
        siteName,
        // TODO create a dedicated map of chain name to site name schema
        chainName === "rav-hen" ? ravHenSiteNameSchema : planetSiteNameSchema,
      ).mapErr(
        (err) =>
          new BadInputException(
            `Site with name [${siteName}] isn't associated with chain with name [${chainName}]`,
            { cause: err },
          ),
      ),
  );
}
