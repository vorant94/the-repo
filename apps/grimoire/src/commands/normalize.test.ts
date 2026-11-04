import assert from "node:assert/strict";
import { test } from "node:test";
import type { DeckCard } from "../schemas/deck.ts";
import { normalize } from "./normalize.ts";

test("replaces three Hydroblasts with three Blue Elemental Blasts", () => {
  const deck: Array<DeckCard> = [
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("leaves three Blue Elemental Blasts unchanged", () => {
  const deck: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("combines two Hydroblasts and two Blue Elemental Blasts into four preferred copies", () => {
  const deck: Array<DeckCard> = [
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("keeps two Hydroblasts after filling four preferred copies from six combined cards", () => {
  const deck: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("normalizes sideboard cards without moving them into the mainboard", () => {
  const deck: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("applies the four-copy limit across both boards and fills the mainboard first", () => {
  const deck: Array<DeckCard> = [
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("preserves unrelated cards and combines duplicate entries within their board", () => {
  const deck: Array<DeckCard> = [
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Dispel", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Island", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Dispel", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("keeps four copies of each card when all eight slots are needed", () => {
  const deck: Array<DeckCard> = [
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("rejects a pair that cannot fit within four copies of each card", () => {
  const deck: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];
  const expected = /Cannot normalize more than 8 combined copies/;

  assert.throws(() => normalize(deck), expected);
});

test("handles sideboard-only decks", () => {
  const deck: Array<DeckCard> = [
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("leaves a deck with no configured replacements unchanged", () => {
  const deck: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Dispel", zone: "sideboard" },
    { name: "Dispel", zone: "sideboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Dispel", zone: "sideboard" },
    { name: "Dispel", zone: "sideboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("leaves an already normalized mixed deck unchanged", () => {
  const deck: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];
  const expected: Array<DeckCard> = [
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "mainboard" },
    { name: "Blue Elemental Blast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];

  assert.deepEqual(normalize(deck), expected);
});

test("does not modify the input deck", () => {
  const deck: Array<DeckCard> = [
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];
  const expected = [
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "mainboard" },
    { name: "Hydroblast", zone: "sideboard" },
  ];

  normalize(deck);

  assert.deepEqual(deck, expected);
});

test("handles an empty deck", () => {
  const deck: Array<DeckCard> = [];
  const expected: Array<DeckCard> = [];

  assert.deepEqual(normalize(deck), expected);
});
