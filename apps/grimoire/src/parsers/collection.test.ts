import assert from "node:assert/strict";
import { test } from "node:test";
import type { CollectionCard } from "../schemas/collection.ts";
import { parseCollection } from "./collection.ts";

const header =
  "Binder Name,Binder Type,Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Signed,Condition,Language,Proxy,Purchase price currency,Added";
const bloodfellCavesLine =
  "TCC Foundations Cube,deck,Bloodfell Caves,FDN,Foundations,259,normal,common,1,100806,8b90dc92-cb66-41d9-89f9-2b6e3cfc8082,0.2,false,false,false,near_mint,en,false,USD,2026-07-22T20:40:54.447Z";
const ajaniLine =
  'TCC Foundations Cube,deck,"Ajani, Caller of the Pride",FDN,Foundations,357,normal,mythic,1,100063,9f329a0b-13cc-48c5-9fb7-38d8a537aa30,8.55,false,false,false,near_mint,en,false,USD,2026-07-31T15:24:42.657Z';

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
