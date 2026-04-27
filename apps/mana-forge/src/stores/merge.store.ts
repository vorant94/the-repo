import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card, TextFile } from "../utils/card.ts";
import { parseCollectionFile } from "../utils/card.ts";

export interface MergeResult {
  cards: Array<Card>;
}

interface MergeStore {
  files: Array<TextFile>;
  result: MergeResult | null;

  addFiles: (newFiles: Array<TextFile>) => void;
  removeFile: (index: number) => void;
  merge: () => void;
  reset: () => void;
}

function mergeCards(lists: Array<Array<Card>>): Array<Card> {
  const nameToCard = new Map<string, Card>();

  for (const list of lists) {
    for (const card of list) {
      const existing = nameToCard.get(card.name);
      if (!existing || card.quantity > existing.quantity) {
        nameToCard.set(card.name, { ...card });
      }
    }
  }

  return Array.from(nameToCard.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export const useMergeStore = create<MergeStore>()(
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

    merge: () =>
      set((state) => {
        const lists = state.files.map((f) => parseCollectionFile(f.content));
        state.result = { cards: mergeCards(lists) };
      }),

    reset: () =>
      set((state) => {
        state.files = [];
        state.result = null;
      }),
  })),
);
