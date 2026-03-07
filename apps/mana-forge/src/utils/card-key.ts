import type { Card } from "../stores/split.store.ts";

export const cardKey = (card: Card): string =>
  `${card.name}|${card.setCode}|${card.collectorNumber}|${card.foil}`;
