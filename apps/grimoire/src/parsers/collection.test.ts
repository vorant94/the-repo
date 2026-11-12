import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CardCounts } from "../card-counts.ts";
import type { BinderCard, CollectionCard } from "../schemas/collection.ts";
import {
  countBinderCardsByName,
  parseBinder,
  parseCollection,
} from "./collection.ts";

const header =
  "Binder Name,Binder Type,Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Signed,Condition,Language,Proxy,Purchase price currency,Added";
const bloodfellCavesLine =
  "TCC Foundations Cube,deck,Bloodfell Caves,FDN,Foundations,259,normal,common,1,100806,8b90dc92-cb66-41d9-89f9-2b6e3cfc8082,0.2,false,false,false,near_mint,en,false,USD,2026-07-22T20:40:54.447Z";
const ajaniLine =
  'TCC Foundations Cube,deck,"Ajani, Caller of the Pride",FDN,Foundations,357,normal,mythic,1,100063,9f329a0b-13cc-48c5-9fb7-38d8a537aa30,8.55,false,false,false,near_mint,en,false,USD,2026-07-31T15:24:42.657Z';
const binderHeader =
  "Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Signed,Condition,Language,Proxy,Purchase price currency,Added";
const binderLine =
  '"Ajani, Caller of the Pride",FDN,Foundations,357,normal,mythic,1,100063,9f329a0b-13cc-48c5-9fb7-38d8a537aa30,8.55,false,false,false,near_mint,en,false,USD,2026-07-31T15:24:42.657Z';

describe("parseCollection", () => {
  test("parses the collection bypassing header row", () => {
    const parsed = parseCollection(
      [header, bloodfellCavesLine, ajaniLine].join("\n"),
    );

    assert.deepEqual(parsed, [bloodfellCaves, ajani]);
  });

  test("parses line", () => {
    const parsed = parseCollection(`${header}\n${bloodfellCavesLine}`);

    assert.deepEqual(parsed, [bloodfellCaves]);
  });

  test("parses line with names in quotes", () => {
    const parsed = parseCollection(`${header}\n${ajaniLine}`);

    assert.deepEqual(parsed, [ajani]);
  });

  test("preserves etched foil in collection exports", () => {
    const content = `${header}\n${bloodfellCavesLine.replace(",normal,", ",etched,")}`;
    const expected = [{ ...bloodfellCaves, foil: "etched" }];

    assert.deepEqual(parseCollection(content), expected);
  });
});

describe("parseBinder", () => {
  test("parses full exports as binder records", () => {
    const { binderName, binderType, ...card } = bloodfellCaves;
    const expected = [card];

    assert.deepEqual(parseBinder(`${header}\n${bloodfellCavesLine}`), expected);
  });

  test("parses binder exports without fabricating binder metadata", () => {
    const { binderName, binderType, ...card } = ajani;
    const expected = [card];

    assert.deepEqual(parseBinder(`${binderHeader}\n${binderLine}`), expected);
  });

  test("accepts BOM and CRLF in binder exports", () => {
    const { binderName, binderType, ...card } = ajani;
    const expected = [card];

    assert.deepEqual(
      parseBinder(`\uFEFF${binderHeader}\r\n${binderLine}\r\n`),
      expected,
    );
  });

  test("preserves light_played condition in binder exports", () => {
    const { binderName, binderType, ...card } = ajani;
    const content = `${binderHeader}\n${binderLine.replace(",near_mint,", ",light_played,")}`;
    const expected = [{ ...card, condition: "light_played" }];

    assert.deepEqual(parseBinder(content), expected);
  });

  test("accepts header-only binder exports", () => {
    const expected: Array<BinderCard> = [];

    assert.deepEqual(parseBinder(binderHeader), expected);
  });

  test("rejects missing collection columns", () => {
    const expected = /Missing collection CSV column: setCode/;

    assert.throws(() => parseBinder("Name,Quantity\nCounterspell,2"), expected);
  });

  test("rejects malformed CSV", () => {
    const expected = /Invalid collection CSV/;

    assert.throws(
      () => parseBinder(`${binderHeader}\n"unterminated`),
      expected,
    );
  });
});

describe("countBinderCardsByName", () => {
  test("sums copies across printings, languages, and proxies without mutating records", () => {
    const { binderName, binderType, ...card } = bloodfellCaves;
    const cards: Array<BinderCard> = [
      { ...card, quantity: 2 },
      {
        ...card,
        setCode: "KTK",
        collectorNumber: "230",
        foil: "foil",
        language: "ja",
        proxy: true,
        quantity: 3,
      },
      { ...card, name: "Counterspell", quantity: 0 },
    ];
    const original = structuredClone(cards);
    const expected: CardCounts = new Map([["Bloodfell Caves", 5]]);

    assert.deepEqual(countBinderCardsByName(cards), expected);
    assert.deepEqual(cards, original);
  });

  test("returns empty counts for an empty binder", () => {
    const expected: CardCounts = new Map();

    assert.deepEqual(countBinderCardsByName([]), expected);
  });
});

const bloodfellCaves = {
  binderName: "TCC Foundations Cube",
  binderType: "deck",
  name: "Bloodfell Caves",
  setCode: "FDN",
  setName: "Foundations",
  collectorNumber: "259",
  foil: "normal",
  rarity: "common",
  quantity: 1,
  manaboxId: 100806,
  scryfallId: "8b90dc92-cb66-41d9-89f9-2b6e3cfc8082",
  purchasePrice: 0.2,
  misprint: false,
  altered: false,
  signed: false,
  condition: "near_mint",
  language: "en",
  proxy: false,
  purchasePriceCurrency: "USD",
  added: "2026-07-22T20:40:54.447Z",
} satisfies CollectionCard;

const ajani = {
  binderName: "TCC Foundations Cube",
  binderType: "deck",
  name: "Ajani, Caller of the Pride",
  setCode: "FDN",
  setName: "Foundations",
  collectorNumber: "357",
  foil: "normal",
  rarity: "mythic",
  quantity: 1,
  manaboxId: 100063,
  scryfallId: "9f329a0b-13cc-48c5-9fb7-38d8a537aa30",
  purchasePrice: 8.55,
  misprint: false,
  altered: false,
  signed: false,
  condition: "near_mint",
  language: "en",
  proxy: false,
  purchasePriceCurrency: "USD",
  added: "2026-07-31T15:24:42.657Z",
} satisfies CollectionCard;
