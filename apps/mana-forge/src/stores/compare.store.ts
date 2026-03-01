import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { cardKey } from "../utils/card-key.ts";
import type { Card } from "./split.store.ts";

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

function parseCollectionCard(line: string): Card | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) {
    return null;
  }

  const quantityStr = trimmed.slice(0, firstSpace);
  const quantity = Number.parseInt(quantityStr, 10);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return null;
  }

  const setCodeStart = trimmed.lastIndexOf(" (");
  if (setCodeStart === -1 || setCodeStart <= firstSpace) {
    return null;
  }

  const name = trimmed.slice(firstSpace + 1, setCodeStart).trim();
  if (!name) {
    return null;
  }

  const setCodeEnd = trimmed.indexOf(")", setCodeStart);
  if (setCodeEnd === -1) {
    return null;
  }

  const setCode = trimmed.slice(setCodeStart + 2, setCodeEnd);
  if (!setCode) {
    return null;
  }

  const afterSetCode = trimmed.slice(setCodeEnd + 1).trim();
  if (!afterSetCode) {
    return null;
  }

  const foil = afterSetCode.endsWith("*F*");
  const collectorNumber = foil
    ? afterSetCode.slice(0, -3).trim()
    : afterSetCode;

  if (!collectorNumber) {
    return null;
  }

  return { quantity, name, setCode, collectorNumber, foil };
}

function parseCollectionFile(content: string): Array<Card> {
  const cards: Array<Card> = [];

  for (const line of content.split("\n")) {
    const card = parseCollectionCard(line);
    if (card) {
      cards.push(card);
    }
  }

  return cards;
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
        const lists = state.files.map((f) => parseCollectionFile(f.content));
        state.result = compareCards(lists);
      }),

    reset: () =>
      set((state) => {
        state.files = [];
        state.result = null;
      }),
  })),
);
