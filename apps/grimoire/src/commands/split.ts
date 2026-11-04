import { formatBinder, parseCollection } from "../parsers/collection.ts";
import type { CollectionCard } from "../schemas/collection.ts";

export function split(content: string): {
  tradelist: string;
  wishlist: string;
} {
  const tradelist = new Map<string, CollectionCard>();
  const wishlist = new Map<string, CollectionCard>();

  for (const card of parseCollection(content)) {
    const isWishlist = isWishlistCard(card);
    const isTradelist = isTradelistCard(card);
    if (!isWishlist && !isTradelist) {
      continue;
    }

    const target = isWishlist ? wishlist : tradelist;
    const key = JSON.stringify([
      card.name,
      card.setCode,
      card.collectorNumber,
      card.foil,
      card.language,
    ]);
    const existing = target.get(key);
    if (existing) {
      existing.quantity += card.quantity;
      continue;
    }

    target.set(key, card);
  }

  return {
    tradelist: formatBinder(Array.from(tradelist.values())),
    wishlist: formatBinder(Array.from(wishlist.values())),
  };
}

function isWishlistCard(card: CollectionCard): boolean {
  return !card.proxy && card.binderType === "list";
}

function isTradelistCard(card: CollectionCard): boolean {
  return (
    !card.proxy &&
    card.binderType === "binder" &&
    card.binderName.startsWith("B3-")
  );
}
