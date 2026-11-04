import type { DeckCard } from "../schemas/deck.ts";

export function normalize(deck: Array<DeckCard>): Array<DeckCard> {
  const normalized = deck.map((card) => ({ ...card }));

  for (const { preferred, alternative } of replaceableCards) {
    const matching = normalized.filter(
      (card) => card.name === preferred || card.name === alternative,
    );
    if (matching.length > maxCopies * 2) {
      throw new Error(
        `Cannot normalize more than ${maxCopies * 2} combined copies of ${preferred} and ${alternative}.`,
      );
    }

    const ordered = [
      ...matching.filter((card) => card.zone === "mainboard"),
      ...matching.filter((card) => card.zone === "sideboard"),
    ];
    for (const [index, card] of ordered.entries()) {
      card.name = index < maxCopies ? preferred : alternative;
    }
  }

  return normalized;
}

const maxCopies = 4;
const replaceableCards = [
  { preferred: "Blue Elemental Blast", alternative: "Hydroblast" },
  { preferred: "Red Elemental Blast", alternative: "Pyroblast" },
  { preferred: "End the Festivities", alternative: "Tectonic Hazard" },
  { preferred: "Thought Scour", alternative: "Mental Note" },
];
