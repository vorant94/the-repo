import assert from "node:assert/strict";
import { test } from "node:test";
import Papa from "papaparse";
import { split } from "./split.ts";

const header =
  "Binder Name,Binder Type,Name,Set code,Set name,Collector number,Foil,Rarity,Quantity,ManaBox ID,Scryfall ID,Purchase price,Misprint,Altered,Signed,Condition,Language,Proxy,Purchase price currency,Added";

test("puts lists in the wishlist and only B3- binders in the tradelist", () => {
  const collection = [
    header,
    "Wishlist,list,Counterspell,MMA,Modern Masters,1,normal,common,1,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Wishlist,list,Dispel,MMA,Modern Masters,2,normal,common,1,124,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Blue,binder,Force Spike,MMA,Modern Masters,3,normal,common,1,125,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B2-Keep,binder,Envelop,MMA,Modern Masters,4,normal,common,1,126,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Deck,deck,Island,MMA,Modern Masters,5,normal,common,1,127,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { wishlist, tradelist } = split(collection);
  const wishlistCards = Papa.parse<Record<string, string>>(wishlist, {
    header: true,
    skipEmptyLines: true,
  }).data;
  const tradelistCards = Papa.parse<Record<string, string>>(tradelist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    wishlistCards.map((card) => card.Name),
    ["Counterspell", "Dispel"],
  );
  assert.deepEqual(
    tradelistCards.map((card) => card.Name),
    ["Force Spike"],
  );
});

test("combines matching printings in the wishlist", () => {
  const collection = [
    header,
    "B3-First,list,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,list,Counterspell,MMA,Modern Masters,1,normal,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { wishlist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(wishlist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.Name, "Counterspell");
  assert.equal(cards[0]?.Quantity, "5");
});

test("keeps different sets separate in the wishlist", () => {
  const collection = [
    header,
    "B3-First,list,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,list,Counterspell,FDN,Modern Masters,1,normal,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { wishlist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(wishlist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card["Set code"], card.Quantity]),
    [
      ["Counterspell", "MMA", "2"],
      ["Counterspell", "FDN", "3"],
    ],
  );
});

test("keeps different collector numbers separate in the wishlist", () => {
  const collection = [
    header,
    "B3-First,list,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,list,Counterspell,MMA,Modern Masters,2,normal,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { wishlist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(wishlist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card["Collector number"], card.Quantity]),
    [
      ["Counterspell", "1", "2"],
      ["Counterspell", "2", "3"],
    ],
  );
});

test("keeps different foil finishes separate in the wishlist", () => {
  const collection = [
    header,
    "B3-First,list,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,list,Counterspell,MMA,Modern Masters,1,foil,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { wishlist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(wishlist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card.Foil, card.Quantity]),
    [
      ["Counterspell", "normal", "2"],
      ["Counterspell", "foil", "3"],
    ],
  );
});

test("keeps different languages separate in the wishlist", () => {
  const collection = [
    header,
    "B3-First,list,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,list,Counterspell,MMA,Modern Masters,1,normal,common,3,123,id,,false,false,false,near_mint,ru,false,USD,2026-07-22",
  ].join("\n");

  const { wishlist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(wishlist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card.Language, card.Quantity]),
    [
      ["Counterspell", "en", "2"],
      ["Counterspell", "ru", "3"],
    ],
  );
});

test("combines matching printings in the tradelist", () => {
  const collection = [
    header,
    "B3-First,binder,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,binder,Counterspell,MMA,Modern Masters,1,normal,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { tradelist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(tradelist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.equal(cards.length, 1);
  assert.equal(cards[0]?.Name, "Counterspell");
  assert.equal(cards[0]?.Quantity, "5");
});

test("keeps different sets separate in the tradelist", () => {
  const collection = [
    header,
    "B3-First,binder,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,binder,Counterspell,FDN,Modern Masters,1,normal,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { tradelist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(tradelist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card["Set code"], card.Quantity]),
    [
      ["Counterspell", "MMA", "2"],
      ["Counterspell", "FDN", "3"],
    ],
  );
});

test("keeps different collector numbers separate in the tradelist", () => {
  const collection = [
    header,
    "B3-First,binder,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,binder,Counterspell,MMA,Modern Masters,2,normal,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { tradelist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(tradelist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card["Collector number"], card.Quantity]),
    [
      ["Counterspell", "1", "2"],
      ["Counterspell", "2", "3"],
    ],
  );
});

test("keeps different foil finishes separate in the tradelist", () => {
  const collection = [
    header,
    "B3-First,binder,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,binder,Counterspell,MMA,Modern Masters,1,foil,common,3,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
  ].join("\n");

  const { tradelist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(tradelist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card.Foil, card.Quantity]),
    [
      ["Counterspell", "normal", "2"],
      ["Counterspell", "foil", "3"],
    ],
  );
});

test("keeps different languages separate in the tradelist", () => {
  const collection = [
    header,
    "B3-First,binder,Counterspell,MMA,Modern Masters,1,normal,common,2,123,id,,false,false,false,near_mint,en,false,USD,2026-07-22",
    "B3-Second,binder,Counterspell,MMA,Modern Masters,1,normal,common,3,123,id,,false,false,false,near_mint,ru,false,USD,2026-07-22",
  ].join("\n");

  const { tradelist } = split(collection);
  const cards = Papa.parse<Record<string, string>>(tradelist, {
    header: true,
    skipEmptyLines: true,
  }).data;

  assert.deepEqual(
    cards.map((card) => [card.Name, card.Language, card.Quantity]),
    [
      ["Counterspell", "en", "2"],
      ["Counterspell", "ru", "3"],
    ],
  );
});
