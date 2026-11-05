import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { configContext } from "../config-context.ts";
import type { CollectionCard } from "../schemas/collection.ts";
import type { Config } from "../schemas/config.ts";
import { split } from "./split.ts";

describe("split", () => {
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

    assert.deepEqual(
      configContext.run({ split: config }, () => split(collection)),
      expected,
    );
  });

  test("combines matching printings in the wishlist", () => {
    const collection: Array<CollectionCard> = [
      { ...counterspell, binderName: "First", binderType: "list", quantity: 2 },
      {
        ...counterspell,
        binderName: "Second",
        binderType: "list",
        quantity: 3,
      },
    ];
    const expected: Array<CollectionCard> = [
      { ...counterspell, binderName: "First", binderType: "list", quantity: 5 },
    ];

    const [, wishlist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [, wishlist] = configContext.run({ split: config }, () =>
      split(collection),
    );

    assert.deepEqual(wishlist, expected);
  });

  test("keeps different collector numbers separate in the wishlist", () => {
    const collection: Array<CollectionCard> = [
      { ...counterspell, binderType: "list", quantity: 2 },
      {
        ...counterspell,
        binderType: "list",
        collectorNumber: "2",
        quantity: 3,
      },
    ];
    const expected: Array<CollectionCard> = [
      { ...counterspell, binderType: "list", quantity: 2 },
      {
        ...counterspell,
        binderType: "list",
        collectorNumber: "2",
        quantity: 3,
      },
    ];

    const [, wishlist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [, wishlist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [, wishlist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [tradelist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [tradelist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [tradelist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [tradelist] = configContext.run({ split: config }, () =>
      split(collection),
    );

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

    const [tradelist] = configContext.run({ split: config }, () =>
      split(collection),
    );

    assert.deepEqual(tradelist, expected);
  });

  test("uses configured regex alternatives while respecting binder types and excluding proxies", () => {
    const collection: Array<CollectionCard> = [
      { ...counterspell, binderName: "Trade-Blue" },
      { ...counterspell, binderName: "Extras" },
      { ...counterspell, binderName: "B3-Blue" },
      { ...counterspell, binderName: "Want-Blue", binderType: "list" },
      { ...counterspell, binderName: "Wishlist", binderType: "list" },
      { ...counterspell, binderName: "Other", binderType: "list" },
      { ...counterspell, binderName: "Trade-Blue", binderType: "list" },
      { ...counterspell, binderName: "Want-Blue" },
      { ...counterspell, binderName: "Trade-Blue", binderType: "deck" },
      { ...counterspell, binderName: "Trade-Blue", proxy: true },
      {
        ...counterspell,
        binderName: "Want-Blue",
        binderType: "list",
        proxy: true,
      },
    ];
    const customConfig: Config["split"] = {
      tradelist: { binderNamePattern: /^Trade-|^Extras$/ },
      wishlist: { binderNamePattern: /^Want-|^Wishlist$/ },
    };
    const expected: [Array<CollectionCard>, Array<CollectionCard>] = [
      [{ ...counterspell, binderName: "Trade-Blue", quantity: 2 }],
      [
        {
          ...counterspell,
          binderName: "Want-Blue",
          binderType: "list",
          quantity: 2,
        },
      ],
    ];

    assert.deepEqual(
      configContext.run({ split: customConfig }, () => split(collection)),
      expected,
    );
  });

  test("selects nothing when patterns match no names", () => {
    const collection: Array<CollectionCard> = [
      counterspell,
      { ...counterspell, binderName: "Wishlist", binderType: "list" },
    ];
    const config: Config["split"] = {
      tradelist: { binderNamePattern: /(?!)/ },
      wishlist: { binderNamePattern: /(?!)/ },
    };
    const expected = [[], []];

    assert.deepEqual(
      configContext.run({ split: config }, () => split(collection)),
      expected,
    );
  });

  test("keeps split selections isolated across concurrent config contexts", async () => {
    const collection: Array<CollectionCard> = [counterspell];
    const expected = [
      [[counterspell], []],
      [[], []],
    ];

    const results = await Promise.all([
      configContext.run({ split: config }, async () => {
        await Promise.resolve();
        return split(collection);
      }),
      configContext.run(
        {
          split: {
            tradelist: { binderNamePattern: /^Trade-/ },
            wishlist: { binderNamePattern: /^Want-/ },
          },
        },
        async () => {
          await Promise.resolve();
          return split(collection);
        },
      ),
    ]);

    assert.deepEqual(results, expected);
  });
});

const config: Config["split"] = {
  tradelist: { binderNamePattern: /^B3-/ },
  wishlist: { binderNamePattern: /.*/ },
};

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
