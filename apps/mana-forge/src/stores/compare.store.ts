import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card, TextFile } from "../utils/card.ts";
import { cardKey, isBasicLand, parseCollectionFile } from "../utils/card.ts";
import { parseManaBoxSelectionCsv } from "../utils/manabox-csv.ts";

export const resultSectionId = {
  exactMatches: "exactMatches",
  partialMatches: "partialMatches",
  onlyInFirst: "onlyInFirst",
  onlyInSecond: "onlyInSecond",
} as const;

export type ResultSectionId =
  (typeof resultSectionId)[keyof typeof resultSectionId];

export interface CompareResult {
  exactMatches: Array<Card>;
  partialMatches: Array<Card>;
  onlyInFirst: Array<Card>;
  onlyInSecond: Array<Card>;
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
      onlyInFirst: [],
      onlyInSecond: [],
      similarity: 0,
      similarityWithoutBasicLands: 0,
    };
  }

  const perListKeyQty = lists.map((list) => {
    const map = new Map<string, number>();
    for (const card of list) {
      const key = cardKey(card);
      map.set(key, (map.get(key) ?? 0) + card.quantity);
    }
    return map;
  });

  const perListNameQty = lists.map((list) => {
    const map = new Map<string, number>();
    for (const card of list) {
      map.set(card.name, (map.get(card.name) ?? 0) + card.quantity);
    }
    return map;
  });

  const representativeByKey = new Map<string, Card>();
  const representativeByName = new Map<string, Card>();
  for (const list of lists) {
    for (const card of list) {
      if (!representativeByKey.has(cardKey(card))) {
        representativeByKey.set(cardKey(card), card);
      }
      if (!representativeByName.has(card.name)) {
        representativeByName.set(card.name, card);
      }
    }
  }

  const exactMatches: Array<Card> = [];
  const exactMatchNames = new Set<string>();

  for (const [key, card] of representativeByKey) {
    if (!perListKeyQty.every((map) => map.has(key))) {
      continue;
    }
    const minQty = perListKeyQty.reduce(
      (min, map) => Math.min(min, map.get(key) ?? min),
      Number.MAX_SAFE_INTEGER,
    );
    exactMatches.push({ ...card, quantity: minQty });
    exactMatchNames.add(card.name);
  }

  const partialMatches: Array<Card> = [];

  for (const [name, card] of representativeByName) {
    if (exactMatchNames.has(name)) {
      continue;
    }
    if (!perListNameQty.every((map) => map.has(name))) {
      continue;
    }
    const minQty = perListNameQty.reduce(
      (min, map) => Math.min(min, map.get(name) ?? min),
      Number.MAX_SAFE_INTEGER,
    );
    partialMatches.push({ ...card, quantity: minQty });
  }

  const firstList = lists[0];
  const secondList = lists[1];

  if (!firstList || !secondList) {
    return {
      exactMatches: [],
      partialMatches: [],
      onlyInFirst: [],
      onlyInSecond: [],
      similarity: 0,
      similarityWithoutBasicLands: 0,
    };
  }

  const firstNameQty = perListNameQty[0];
  const secondNameQty = perListNameQty[1];

  if (!firstNameQty || !secondNameQty) {
    return {
      exactMatches: [],
      partialMatches: [],
      onlyInFirst: [],
      onlyInSecond: [],
      similarity: 0,
      similarityWithoutBasicLands: 0,
    };
  }

  const firstNameToCard = new Map<string, Card>();
  for (const card of firstList) {
    firstNameToCard.set(card.name, card);
  }

  const secondNameToCard = new Map<string, Card>();
  for (const card of secondList) {
    secondNameToCard.set(card.name, card);
  }

  const allNames = new Set([...firstNameQty.keys(), ...secondNameQty.keys()]);

  const onlyInFirst: Array<Card> = [];
  const onlyInSecond: Array<Card> = [];

  for (const name of allNames) {
    const qty1 = firstNameQty.get(name) ?? 0;
    const qty2 = secondNameQty.get(name) ?? 0;

    if (qty1 > qty2) {
      const card = firstNameToCard.get(name);
      if (card) {
        onlyInFirst.push({ ...card, quantity: qty1 - qty2 });
      }
    } else if (qty2 > qty1) {
      const card = secondNameToCard.get(name);
      if (card) {
        onlyInSecond.push({ ...card, quantity: qty2 - qty1 });
      }
    }
  }

  return {
    exactMatches,
    partialMatches,
    onlyInFirst,
    onlyInSecond,
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
        state.files = newFiles.slice(0, 2);
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
