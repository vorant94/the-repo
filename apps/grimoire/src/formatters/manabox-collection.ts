import { z } from "zod";

export const manaBoxCollectionCardSchema = z.object({
  "Binder Name": z.string(),
  "Binder Type": z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Name: z.string(),
  "Set code": z.string(),
  "Collector number": z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Foil: z.string().transform((raw) => raw === "foil"),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Quantity: z.coerce.number(),
});
