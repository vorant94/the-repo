import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { getSetCards } from "../api/scryfall.ts";

export interface Pick {
  setCode: string;
  setName: string;
  matchedCardNames: Array<string>;
  overlap: number;
}

interface PickStore {
  wishlistText: string;
  setCodesText: string;
  recommendations: Array<Pick>;
  isLoading: boolean;
  error: string | null;

  setWishlistText: (wishlistText: string) => void;
  setSetCodesText: (setCodesText: string) => void;
  recommend: () => Promise<void>;
  reset: () => void;
}

export const usePickStore = create<PickStore>()(
  immer((set, get) => ({
    wishlistText: "",
    setCodesText: "",
    recommendations: [],
    isLoading: false,
    error: null,

    setWishlistText: (wishlistText) =>
      set((state) => {
        state.wishlistText = wishlistText;
      }),

    setSetCodesText: (setCodesText) =>
      set((state) => {
        state.setCodesText = setCodesText;
      }),

    recommend: async () => {
      const wishlist = parseLines(get().wishlistText);
      const setCodes = parseSetCodes(get().setCodesText);

      if (wishlist.length === 0 || setCodes.length === 0) {
        set((state) => {
          state.recommendations = [];
          state.error = "Add at least one wishlist card and one set code.";
        });
        return;
      }

      set((state) => {
        state.isLoading = true;
        state.error = null;
        state.recommendations = [];
      });

      try {
        const recommendations = await Promise.all(
          setCodes.map((setCode) => findRecommendation(setCode, wishlist)),
        );

        set((state) => {
          state.recommendations = recommendations.sort(
            (first, second) =>
              second.matchedCardNames.length - first.matchedCardNames.length ||
              first.setName.localeCompare(second.setName),
          );
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "Could not search Scryfall. Please try again.";
        });
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },

    reset: () =>
      set((state) => {
        state.wishlistText = "";
        state.setCodesText = "";
        state.recommendations = [];
        state.isLoading = false;
        state.error = null;
      }),
  })),
);

function parseLines(value: string): Array<string> {
  const seen = new Set<string>();

  return value
    .split("\n")
    .filter((line) => {
      const normalized = line.trim();
      if (!normalized || seen.has(normalized.toLowerCase())) {
        return false;
      }

      seen.add(normalized.toLowerCase());
      return true;
    })
    .map((line) => line.trim());
}

function parseSetCodes(value: string): Array<string> {
  return Array.from(
    new Set(parseLines(value).map((setCode) => setCode.toLowerCase())),
  );
}

async function findRecommendation(
  setCode: string,
  wishlist: Array<string>,
): Promise<Pick> {
  const cardNames = new Map(wishlist.map((name) => [name.toLowerCase(), name]));
  const cards = await getSetCards(setCode);
  const matchedCardNames = new Set<string>();
  let setName = cards[0]?.setName ?? setCode.toUpperCase();

  for (const card of cards) {
    const wishlistName = cardNames.get(card.name.toLowerCase());
    if (!wishlistName) {
      continue;
    }

    matchedCardNames.add(wishlistName);
    setName = card.setName;
  }

  return {
    setCode,
    setName,
    matchedCardNames: Array.from(matchedCardNames).sort((first, second) =>
      first.localeCompare(second),
    ),
    overlap: (matchedCardNames.size / wishlist.length) * 100,
  };
}
