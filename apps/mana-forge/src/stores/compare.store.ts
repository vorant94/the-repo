import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card, TextFile } from "../utils/card.ts";
import { cardKey, isBasicLand, parseCollectionFile } from "../utils/card.ts";
import { parseManaBoxSelectionCsv } from "../utils/manabox-csv.ts";

export const resultSectionId = {
  exactMatches: "exactMatches",
  partialMatches: "partialMatches",
} as const;

export type ResultSectionId =
  (typeof resultSectionId)[keyof typeof resultSectionId];

export interface CompareResult {
  exactMatches: Array<Card>;
  partialMatches: Array<Card>;
  similarity: number;
  similarityWithoutBasicLands: number;
}

interface CompareStore {
  files: Array<TextFile>;
  result: CompareResult | null;

  addFiles: (newFiles: Array<TextFile>) => void;
  removeFile: (index: number) => void;
  compare: () => void;
  reset: () => void;
}

function compareCards(lists: Array<Array<Card>>): CompareResult {
  if (lists.length < 2) {
    return {
      exactMatches: [],
      partialMatches: [],
      similarity: 0,
      similarityWithoutBasicLands: 0,
    };
  }

  const fileCount = lists.length;

  const exactKeyCounts = new Map<string, number>();
  const partialKeyCounts = new Map<string, number>();
  const exactKeyToCard = new Map<string, Card>();
  const partialKeyToCard = new Map<string, Card>();

  for (const list of lists) {
    const seenExactKeys = new Set<string>();
    const seenPartialKeys = new Set<string>();

    for (const card of list) {
      const exactKey = cardKey(card);
      const partialKey = card.name;

      if (!seenExactKeys.has(exactKey)) {
        seenExactKeys.add(exactKey);
        exactKeyCounts.set(exactKey, (exactKeyCounts.get(exactKey) ?? 0) + 1);
        if (!exactKeyToCard.has(exactKey)) {
          exactKeyToCard.set(exactKey, card);
        }
      }

      if (!seenPartialKeys.has(partialKey)) {
        seenPartialKeys.add(partialKey);
        partialKeyCounts.set(
          partialKey,
          (partialKeyCounts.get(partialKey) ?? 0) + 1,
        );
        if (!partialKeyToCard.has(partialKey)) {
          partialKeyToCard.set(partialKey, card);
        }
      }
    }
  }

  const exactMatches: Array<Card> = [];
  const exactMatchNames = new Set<string>();

  for (const [key, count] of exactKeyCounts) {
    if (count !== fileCount) {
      continue;
    }

    const card = exactKeyToCard.get(key);
    if (!card) {
      continue;
    }

    exactMatches.push(card);
    exactMatchNames.add(card.name);
  }

  const partialMatches: Array<Card> = [];

  for (const [name, count] of partialKeyCounts) {
    if (count !== fileCount) {
      continue;
    }

    if (exactMatchNames.has(name)) {
      continue;
    }

    const card = partialKeyToCard.get(name);
    if (!card) {
      continue;
    }

    partialMatches.push(card);
  }

  return {
    exactMatches,
    partialMatches,
    similarity: similarityByCopies(lists),
    similarityWithoutBasicLands: similarityByCopies(
      lists.map((list) => list.filter((card) => !isBasicLand(card))),
    ),
  };
}

// Copy-weighted similarity, ignoring version (set/collector number/foil):
// all copies of every card whose name is shared by every deck, relative to
// the combined size of all decks. A card counts fully once present in each
// deck, regardless of differing quantities. For two decks this is
// sum(a + b) over shared names / (totalA + totalB).
function similarityByCopies(lists: Array<Array<Card>>): number {
  let totalCopies = 0;
  const copiesPerList = lists.map((list) => {
    const copies = new Map<string, number>();
    for (const card of list) {
      copies.set(card.name, (copies.get(card.name) ?? 0) + card.quantity);
      totalCopies += card.quantity;
    }
    return copies;
  });

  if (totalCopies === 0) {
    return 0;
  }

  const [firstCopies, ...restCopies] = copiesPerList;
  if (!firstCopies) {
    return 0;
  }

  let matchedCopies = 0;

  for (const [name, count] of firstCopies) {
    if (!restCopies.every((other) => other.has(name))) {
      continue;
    }

    matchedCopies += restCopies.reduce(
      (sum, other) => sum + (other.get(name) ?? 0),
      count,
    );
  }

  return (matchedCopies / totalCopies) * 100;
}

export const useCompareStore = create<CompareStore>()(
  immer((set) => ({
    files: [],
    result: null,

    addFiles: (newFiles) =>
      set((state) => {
        state.files.push(...newFiles);
      }),

    removeFile: (index) =>
      set((state) => {
        state.files.splice(index, 1);
      }),

    compare: () =>
      set((state) => {
        const lists = state.files.map((f) =>
          f.name.endsWith(".csv")
            ? parseManaBoxSelectionCsv(f.content)
            : parseCollectionFile(f.content),
        );
        state.result = compareCards(lists);
      }),

    reset: () =>
      set((state) => {
        state.files = [];
        state.result = null;
      }),
  })),
);
