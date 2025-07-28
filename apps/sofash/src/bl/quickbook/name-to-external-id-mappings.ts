import { z } from "zod";
import type {
  PlanetSiteId,
  QuickbookChainId,
  QuickbookSiteId,
  RavHenSiteId,
} from "../../dal/quickbook/quickbook.dtos.ts";

export const chainNames = ["rav-hen", "planet"] as const;
export type ChainName = (typeof chainNames)[number];
export const chainNameSchema = z.enum(chainNames);

export const ravHenSiteNames = [
  "givatayim",
  "dizengoff",
  "kiryat-ono",
] as const;
export type RavHenSiteName = (typeof ravHenSiteNames)[number];
export const ravHenSiteNameSchema = z.enum(ravHenSiteNames);

export const planetSiteNames = [
  "ayalon",
  "beer-sheva",
  "zichron-yaakov",
  "haifa",
  "jerusalem",
  "rishon-letziyon",
] as const;
export type PlanetSiteName = (typeof planetSiteNames)[number];
export const planetSiteNameSchema = z.enum(planetSiteNames);

export const siteNames = [...ravHenSiteNames, ...planetSiteNames] as const;
export type SiteName = (typeof siteNames)[number];
export const siteNameSchema = z.enum(siteNames);

export const chainNameToQuickbookChainId = {
  "rav-hen": "10104",
  planet: "10100",
} as const satisfies Record<ChainName, QuickbookChainId>;

export const ravHenSiteNameToRavHenSiteId = {
  givatayim: "1058",
  dizengoff: "1071",
  "kiryat-ono": "1062",
} as const satisfies Record<RavHenSiteName, RavHenSiteId>;

export const planetSiteNameToPlanetSiteId = {
  ayalon: "1025",
  "beer-sheva": "1074",
  "zichron-yaakov": "1075",
  haifa: "1070",
  jerusalem: "1073",
  "rishon-letziyon": "1072",
} as const satisfies Record<PlanetSiteName, PlanetSiteId>;

export const chainNameToSiteNameToQuickbookSiteId = {
  "rav-hen": ravHenSiteNameToRavHenSiteId,
  planet: planetSiteNameToPlanetSiteId,
} as const satisfies Record<
  ChainName,
  // fuck this as well, let it be Partial since I'm currently not interested in how to properly type it
  Partial<Record<SiteName, QuickbookSiteId>>
>;
