import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card } from "../utils/card.ts";
import { cardKey, parseCollectionFile } from "../utils/card.ts";
import { parseManaBoxSelectionCsv } from "../utils/manabox-csv.ts";

export interface TextFile {
  name: string;
  content: string;
}

export const resultSectionId = {
  exactMatches: "exactMatches",
  partialMatches: "partialMatches",
} as const;

export type ResultSectionId =
  (typeof resultSectionId)[keyof typeof resultSectionId];

export interface CompareResult {
  exactMatches: Array<Card>;
  partialMatches: Array<Card>;
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
    return { exactMatches: [], partialMatches: [] };
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

  return { exactMatches, partialMatches };
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
