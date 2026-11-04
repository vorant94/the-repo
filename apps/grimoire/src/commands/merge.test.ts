import assert from "node:assert/strict";
import { test } from "node:test";
import type { DeckCard } from "../schemas/deck.ts";
import { merge } from "./merge.ts";

test("merges deck lists keeping maximum amount of each card", () => {
  const decks: Array<Array<DeckCard>> = [
    [
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Force Spike", zone: "mainboard" },
      { name: "Force Spike", zone: "mainboard" },
      { name: "Dispel", zone: "mainboard" },
    ],
    [
      { name: "Counterspell", zone: "mainboard" },
      { name: "Dispel", zone: "mainboard" },
      { name: "Dispel", zone: "mainboard" },
      { name: "Envelop", zone: "mainboard" },
      { name: "Envelop", zone: "mainboard" },
      { name: "Envelop", zone: "mainboard" },
    ],
  ];
  const expected: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
    { name: "Envelop", zone: "mainboard" },
    { name: "Envelop", zone: "mainboard" },
    { name: "Envelop", zone: "mainboard" },
    { name: "Force Spike", zone: "mainboard" },
    { name: "Force Spike", zone: "mainboard" },
  ];

  assert.deepEqual(merge(decks), expected);
});

test("counts mainboard and sideboard copies together within each deck", () => {
  const decks: Array<Array<DeckCard>> = [
    [
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Dispel", zone: "sideboard" },
    ],
    [
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "sideboard" },
      { name: "Dispel", zone: "sideboard" },
      { name: "Dispel", zone: "sideboard" },
    ],
  ];
  const expected: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
  ];

  assert.deepEqual(merge(decks), expected);
});

test("merges four mainboard copies and four sideboard copies into four total copies", () => {
  const decks: Array<Array<DeckCard>> = [
    [
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
    ],
    [
      { name: "Counterspell", zone: "sideboard" },
      { name: "Counterspell", zone: "sideboard" },
      { name: "Counterspell", zone: "sideboard" },
      { name: "Counterspell", zone: "sideboard" },
    ],
  ];
  const expected: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
  ];

  assert.deepEqual(merge(decks), expected);
});
