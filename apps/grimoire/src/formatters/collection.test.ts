import assert from "node:assert/strict";
import { test } from "node:test";
import dedent from "dedent";
import type { CollectionCard } from "../schemas/collection.ts";
import { formatBinder } from "./collection.ts";

test("formats binder CSV without binder columns and escapes quoted names", () => {
  const cards: Array<CollectionCard> = [
    {
      binderName: "Wishlist",
      binderType: "list",
      name: 'Ajani, "Caller"',
      setCode: "FDN",
      setName: "Foundations",
      collectorNumber: "357",
      foil: "normal",
      rarity: "mythic",
      quantity: 2,
      manaboxId: 100063,
      scryfallId: "card-id",
      purchasePrice: null,
      misprint: false,
      altered: false,
      signed: false,
      condition: "near_mint",
      language: "en",
      proxy: false,
      purchasePriceCurrency: "USD",
      added: "2026-07-31T15:24:42.657Z",
    },
  ];
  const expected = dedent`
    Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Signed,Condition,Language,Proxy,Purchase price currency,Added
    "Ajani, ""Caller""",FDN,Foundations,357,normal,mythic,2,100063,card-id,,false,false,false,near_mint,en,false,USD,2026-07-31T15:24:42.657Z
  `;

  assert.equal(formatBinder(cards), `${expected}\n`);
});

test("formats empty binder CSV with its header", () => {
  const cards: Array<CollectionCard> = [];
  const expected = dedent`
    Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Signed,Condition,Language,Proxy,Purchase price currency,Added
  `;

  assert.equal(formatBinder(cards), `${expected}\n`);
});
