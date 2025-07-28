import { z } from "zod";

export const quickbookChainIds = ["10104", "10100"] as const;
export type QuickbookChainId = (typeof quickbookChainIds)[number];
export const quickbookChainIdSchema = z.enum(quickbookChainIds);

export const ravHenSiteIds = ["1058", "1071", "1062"] as const;
export type RavHenSiteId = (typeof ravHenSiteIds)[number];
export const ravHenSiteIdSchema = z.enum(ravHenSiteIds);

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

export const quickbookSiteIds = [...ravHenSiteIds, ...platenSiteIds] as const;
export type QuickbookSiteId = (typeof quickbookSiteIds)[number];
export const quickbookSiteIdSchema = z.enum(quickbookSiteIds);

export const quickbookFilmSchema = z.object({
  id: z.string(),
  name: z.string(),
  length: z.number(),
  posterLink: z.string().url(),
  videoLink: z.string().url().nullish(),
  link: z.string().url(),
  weight: z.number(),
  releaseYear: z.coerce.number(),
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
