import Papa from "papaparse";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Card, TextFile } from "../utils/card.ts";
import { cardKey } from "../utils/card.ts";
import { manaBoxCollectionRowSchema } from "../utils/manabox-csv.ts";

interface SplitStore {
  file: TextFile | null;
  assignments: Record<AssignmentId, Array<Binder>>;

  setFile: (file: TextFile | null) => void;
  moveBinder: (binderId: string, from: AssignmentId, to: AssignmentId) => void;
  reset: () => void;
}

export interface Binder {
  id: string;
  name: string;
  binderType: BinderType;
  cards: Array<Card>;
  cardCount: number;
}

export const useSplitStore = create<SplitStore>()(
  immer((set) => ({
    file: null,
    assignments: {
      collection: [],
      tradeOnly: [],
      tradeOrBuy: [],
      bulk: [],
    },

    setFile: (file) =>
      set((state) => {
        state.file = file;

        if (!file) {
          state.assignments.collection = [];
          state.assignments.tradeOnly = [];
          state.assignments.tradeOrBuy = [];
          state.assignments.bulk = [];
          return;
        }

        const parsed = Papa.parse(file.content, {
          header: true,
          skipEmptyLines: true,
        });

        const binders: Record<string, Binder> = {};

        for (const row of parsed.data) {
          const validRow = manaBoxCollectionRowSchema.parse(row);
          const binderName = validRow["Binder Name"];
          const binderId = `${binderName}${validRow["Binder Type"]}`;

          let binder = binders[binderId];
          if (!binder) {
            binder = {
              id: binderId,
              name: binderName,
              binderType: validRow["Binder Type"],
              cards: [],
              cardCount: 0,
            };
            binders[binderId] = binder;
          }

          binder.cards.push({
            quantity: validRow.Quantity,
            name: validRow.Name,
            setCode: validRow["Set code"],
            collectorNumber: validRow["Collector number"],
            foil: validRow.Foil,
          });
          binder.cardCount += validRow.Quantity;
        }

        state.assignments.collection = Object.values(binders);
      }),

    moveBinder: (binderId, from, to) => {
      set((state) => {
        const fromAssignment = state.assignments[from];
        const toAssignment = state.assignments[to];

        const binderIndex = fromAssignment.findIndex(
          (binder) => binder.id === binderId,
        );
        if (binderIndex < 0) {
          console.debug(
            `tried to move binder with id ${binderId} from assignment ${from} to assignment ${to}, but failed to findIndex`,
          );
          return;
        }

        const [binder] = fromAssignment.splice(binderIndex, 1);
        if (!binder) {
          console.debug(
            `tried to move binder with id ${binderId} from assignment ${from} to assignment ${to}, but failed to splice it`,
          );
          return;
        }

        toAssignment.push(binder);
      });
    },

    reset: () =>
      set((state) => {
        state.file = null;
        state.assignments.collection = [];
        state.assignments.tradeOnly = [];
        state.assignments.tradeOrBuy = [];
        state.assignments.bulk = [];
      }),
  })),
);

export const binderType = {
  binder: "binder",
  deck: "deck",
  list: "list",
} as const;

export type BinderType = (typeof binderType)[keyof typeof binderType];

export const assignmentId = {
  collection: "collection",
  tradeOnly: "tradeOnly",
  tradeOrBuy: "tradeOrBuy",
  bulk: "bulk",
} as const;

export type AssignmentId = (typeof assignmentId)[keyof typeof assignmentId];

export function isAssignmentId(value: string): value is AssignmentId {
  return Object.hasOwn(assignmentId, value);
}

export function mergeBinders(binders: Array<Binder>): Array<Card> {
  const cardMap = new Map<string, Card>();

  for (const binder of binders) {
    for (const card of binder.cards) {
      const key = cardKey(card);
      const existing = cardMap.get(key);
      if (existing) {
        existing.quantity += card.quantity;
      } else {
        cardMap.set(key, { ...card });
      }
    }
  }

  return Array.from(cardMap.values());
}
