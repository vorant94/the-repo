import Papa from "papaparse";
import z from "zod";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SplitStore {
  assignments: Record<AssignmentId, Array<Binder>>;

  parseCollection: (csvContent: string) => void;
  moveBinder: (binderId: string, from: AssignmentId, to: AssignmentId) => void;
}

export interface Card {
  quantity: number;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil: boolean;
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
    assignments: {
      collection: [],
      tradeOnly: [],
      tradeOrBuy: [],
      bulk: [],
    },

    parseCollection: (csvContent) =>
      set((state) => {
        const parsed = Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
        });

        const binders: Record<string, Binder> = {};

        for (const row of parsed.data) {
          const validRow = manaBoxRowSchema.parse(row);
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
  // TODO unify cards into one record if name, set number and foil are equal
  return binders.flatMap((b) => b.cards);
}

export function formatCard(card: Card): string {
  const setCode = card.setCode.toLowerCase();
  const foilMarker = card.foil ? " *F*" : "";
  return `${card.quantity} ${card.name} (${setCode}) ${card.collectorNumber}${foilMarker}`;
}

const manaBoxRowSchema = z.object({
  "Binder Name": z.string(),
  "Binder Type": z.enum(["binder", "deck", "list"]),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Name: z.string(),
  "Set code": z.string(),
  "Collector number": z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Foil: z.string().transform((raw) => raw === "foil"),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Quantity: z.coerce.number(),
});
