import { z } from "zod";

export function parseDeck(content: string): Map<string, number> {
  const counts = new Map<string, number>();

  for (const line of content.split("\n")) {
    const normalized = line.trim();
    const separator = normalized.indexOf(" ");
    if (separator < 0) {
      continue;
    }

    const rawQuantity = normalized.slice(0, separator);
    if (!/^\d+$/.test(rawQuantity)) {
      continue;
    }

    const card = deckCardSchema.parse({
      name: normalized.slice(separator + 1).trim(),
      quantity: rawQuantity,
    });
    const quantity = quantitySchema.parse(
      (counts.get(card.name) ?? 0) + card.quantity,
    );
    counts.set(card.name, quantity);
  }

  return counts;
}

const quantitySchema = z.coerce.number().int().nonnegative();
const deckCardSchema = z.object({
  name: z.string().min(1),
  quantity: quantitySchema,
});
