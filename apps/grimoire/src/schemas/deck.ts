import { z } from "zod";

export const deckCardSchema = z.object({
  name: z.string().min(1),
  zone: z.enum(["mainboard", "sideboard"]),
});
export type DeckCard = z.infer<typeof deckCardSchema>;
