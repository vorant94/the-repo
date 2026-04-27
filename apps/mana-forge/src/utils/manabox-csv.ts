import Papa from "papaparse";
import z from "zod";
import type { Card } from "./card.ts";

const manaBoxBaseRowSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Name: z.string(),
  "Set code": z.string(),
  "Collector number": z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Foil: z.string().transform((raw) => raw === "foil"),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Quantity: z.coerce.number(),
});

export const manaBoxCollectionRowSchema = manaBoxBaseRowSchema.extend({
  "Binder Name": z.string(),
  "Binder Type": z.enum(["binder", "deck", "list"]),
});

export function parseManaBoxSelectionCsv(content: string): Array<Card> {
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  const cards: Array<Card> = [];

  for (const row of parsed.data) {
    const validRow = manaBoxBaseRowSchema.parse(row);
    cards.push({
      quantity: validRow.Quantity,
      name: validRow.Name,
      setCode: validRow["Set code"],
      collectorNumber: validRow["Collector number"],
      foil: validRow.Foil,
    });
  }

  return cards;
}
