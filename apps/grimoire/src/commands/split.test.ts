import assert from "node:assert/strict";
import { test } from "node:test";
import type { CollectionCard } from "../schemas/collection.ts";
import { split } from "./split.ts";

test("puts lists in the wishlist and only B3- binders in the tradelist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderName: "Wishlist", binderType: "list" },
    {
      ...counterspell,
      binderName: "B3-Wishlist",
      binderType: "list",
      name: "Dispel",
    },
    { ...counterspell, binderName: "B3-Blue", name: "Force Spike" },
    { ...counterspell, binderName: "B2-Keep", name: "Envelop" },
    {
      ...counterspell,
      binderName: "B3-Deck",
      binderType: "deck",
      name: "Island",
    },
  ];
  const expected: [Array<CollectionCard>, Array<CollectionCard>] = [
    [{ ...counterspell, binderName: "B3-Blue", name: "Force Spike" }],
    [
      { ...counterspell, binderName: "Wishlist", binderType: "list" },
      {
        ...counterspell,
        binderName: "B3-Wishlist",
        binderType: "list",
        name: "Dispel",
      },
    ],
  ];

  assert.deepEqual(split(collection), expected);
});

test("combines matching printings in the wishlist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderName: "First", binderType: "list", quantity: 2 },
    { ...counterspell, binderName: "Second", binderType: "list", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, binderName: "First", binderType: "list", quantity: 5 },
  ];

  const [, wishlist] = split(collection);

  assert.deepEqual(wishlist, expected);
  assert.deepEqual(
    collection.map((card) => card.quantity),
    [2, 3],
  );
});

test("keeps different sets separate in the wishlist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", setCode: "FDN", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", setCode: "FDN", quantity: 3 },
  ];

  const [, wishlist] = split(collection);

  assert.deepEqual(wishlist, expected);
});

test("keeps different collector numbers separate in the wishlist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", collectorNumber: "2", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", collectorNumber: "2", quantity: 3 },
  ];

  const [, wishlist] = split(collection);

  assert.deepEqual(wishlist, expected);
});

test("keeps different foil finishes separate in the wishlist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", foil: "foil", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", foil: "foil", quantity: 3 },
  ];

  const [, wishlist] = split(collection);

  assert.deepEqual(wishlist, expected);
});

test("keeps different languages separate in the wishlist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", language: "ru", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, binderType: "list", quantity: 2 },
    { ...counterspell, binderType: "list", language: "ru", quantity: 3 },
  ];

  const [, wishlist] = split(collection);

  assert.deepEqual(wishlist, expected);
});

test("combines matching printings in the tradelist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, binderName: "B3-First", quantity: 2 },
    { ...counterspell, binderName: "B3-Second", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, binderName: "B3-First", quantity: 5 },
  ];

  const [tradelist] = split(collection);

  assert.deepEqual(tradelist, expected);
  assert.deepEqual(
    collection.map((card) => card.quantity),
    [2, 3],
  );
});

test("keeps different sets separate in the tradelist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, setCode: "FDN", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, setCode: "FDN", quantity: 3 },
  ];

  const [tradelist] = split(collection);

  assert.deepEqual(tradelist, expected);
});

test("keeps different collector numbers separate in the tradelist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, collectorNumber: "2", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, collectorNumber: "2", quantity: 3 },
  ];

  const [tradelist] = split(collection);

  assert.deepEqual(tradelist, expected);
});

test("keeps different foil finishes separate in the tradelist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, foil: "foil", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, foil: "foil", quantity: 3 },
  ];

  const [tradelist] = split(collection);

  assert.deepEqual(tradelist, expected);
});

test("keeps different languages separate in the tradelist", () => {
  const collection: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, language: "ru", quantity: 3 },
  ];
  const expected: Array<CollectionCard> = [
    { ...counterspell, quantity: 2 },
    { ...counterspell, language: "ru", quantity: 3 },
  ];

  const [tradelist] = split(collection);

  assert.deepEqual(tradelist, expected);
});

const counterspell: CollectionCard = {
  binderName: "B3-Blue",
  binderType: "binder",
  name: "Counterspell",
  setCode: "MMA",
  setName: "Modern Masters",
  collectorNumber: "1",
  foil: "normal",
  rarity: "common",
  quantity: 1,
  manaboxId: 123,
  scryfallId: "id",
  purchasePrice: null,
  misprint: false,
  altered: false,
  signed: false,
  condition: "near_mint",
  language: "en",
  proxy: false,
  purchasePriceCurrency: "USD",
  added: "2026-07-22",
};
