import { z } from "zod";

export const quickbookTenants = ["rav-hen", "planet"] as const;
export type QuickbookTenant = (typeof quickbookTenants)[number];
export const quickbookTenantSchema = z.enum(quickbookTenants);

export const ravHenSites = ["givatayim", "dizengoff", "kiryat-ono"] as const;
export type RavHenSite = (typeof ravHenSites)[number];
export const ravHenSiteSchema = z.enum(ravHenSites);

export const ravHenSiteIds = ["1058", "1071", "1062"] as const;
export type RavHenSiteId = (typeof ravHenSiteIds)[number];
export const ravHenSiteIdSchema = z.enum(ravHenSiteIds);

export const planetSites = [
  "ayalon",
  "beer-sheva",
  "zichron-yaakov",
  "haifa",
  "jerusalem",
  "rishon-letziyon",
] as const;
export type PlanetSite = (typeof planetSites)[number];
export const planetSiteSchema = z.enum(planetSites);

export const platenSiteIds = [
  "1025",
  "1074",
  "1075",
  "1070",
  "1073",
  "1072",
] as const;
export type PlanetSiteId = (typeof platenSiteIds)[number];
export const planetSiteIdSchema = z.enum(platenSiteIds);

export const quickbookSiteSchema = z.union([
  ravHenSiteSchema,
  planetSiteSchema,
]);
export type QuickbookSite = z.infer<typeof quickbookSiteSchema>;

export const quickbookSiteIdSchema = z.union([
  ravHenSiteIdSchema,
  planetSiteIdSchema,
]);
export type QuickbookSiteId = z.infer<typeof quickbookSiteIdSchema>;

export const quickbookFilmSchema = z.object({
  id: z.string(),
  name: z.string(),
  length: z.number(),
  posterLink: z.string().url(),
  videoLink: z.string().url(),
  link: z.string().url(),
  weight: z.number(),
  releaseYear: z.string(),
  attributeIds: z.array(z.string()),
});

export type QuickbookFilmDto = z.infer<typeof quickbookFilmSchema>;

export const quickbookEventSchema = z.object({
  id: z.string(),
  filmId: z.string(),
  cinemaId: z.string(),
  businessDay: z.string().date(),
  eventDateTime: z.coerce.date(),
  attributeIds: z.array(z.string()),
  bookingLink: z.string().url(),
  compositeBookingLink: z.object({
    type: z.string(),
    bookingUrl: z.object({
      url: z.string().url(),
      params: z.object({
        languageId: z.string().optional(),
        saleChannelCode: z.string().optional(),
        code: z.string().optional(),
      }),
    }),
    obsoleteBookingUrl: z.string().url(),
    blockOnlineSales: z.boolean(),
    blockOnlineSalesUntil: z.string().date(),
    serviceUrl: z.string().url(),
  }),
  presentationCode: z.string(),
  soldOut: z.boolean(),
  auditorium: z.string(),
  auditoriumTinyName: z.string(),
});

export type QuickbookEventDto = z.infer<typeof quickbookEventSchema>;
