import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { DeckCard } from "../schemas/deck.ts";
import { compare } from "./compare.ts";

describe("compare", () => {
  test("compares deck lists and calculates deck similarity percentage", () => {
    const decks: Array<Array<DeckCard>> = [
      [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Force Spike", zone: "mainboard" },
        { name: "Dispel", zone: "mainboard" },
      ],
      [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Force of Negation", zone: "mainboard" },
        { name: "Envelop", zone: "mainboard" },
      ],
      [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Spell Pierce", zone: "mainboard" },
        { name: "Blue Elemental Blast", zone: "mainboard" },
      ],
    ];
    const expected = (3 / 9) * 100;

    assert.equal(compare(decks).similarity, expected);
  });

  test("separates matching copies, surplus copies, and unique cards", () => {
    const decks: Array<Array<DeckCard>> = [
      [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Counterspell", zone: "mainboard" },
        { name: "Counterspell", zone: "mainboard" },
        { name: "Counterspell", zone: "sideboard" },
        { name: "Dispel", zone: "sideboard" },
      ],
      [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Counterspell", zone: "sideboard" },
        { name: "Envelop", zone: "mainboard" },
      ],
    ];
    const original = structuredClone(decks);
    const expected = {
      similarity: 75,
      shared: [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Counterspell", zone: "mainboard" },
      ],
      differences: [
        [
          { name: "Counterspell", zone: "mainboard" },
          { name: "Counterspell", zone: "mainboard" },
          { name: "Dispel", zone: "mainboard" },
        ],
        [{ name: "Envelop", zone: "mainboard" }],
      ],
    };

    assert.deepEqual(compare(decks), expected);
    assert.deepEqual(decks, original);
  });

  test("returns all cards as differences when one deck is empty", () => {
    const decks: Array<Array<DeckCard>> = [
      [],
      [{ name: "Dispel", zone: "sideboard" }],
    ];
    const expected = {
      similarity: 0,
      shared: [],
      differences: [[], [{ name: "Dispel", zone: "mainboard" }]],
    };

    assert.deepEqual(compare(decks), expected);
  });

  test("returns empty differences for identical decks", () => {
    const decks: Array<Array<DeckCard>> = [
      [{ name: "Dispel", zone: "sideboard" }],
      [{ name: "Dispel", zone: "sideboard" }],
    ];
    const expected = {
      similarity: 100,
      shared: [{ name: "Dispel", zone: "mainboard" }],
      differences: [[], []],
    };

    assert.deepEqual(compare(decks), expected);
  });

  test("uses the minimum shared quantity across all decks", () => {
    const decks: Array<Array<DeckCard>> = [
      [
        { name: "Dispel", zone: "mainboard" },
        { name: "Dispel", zone: "sideboard" },
      ],
      [{ name: "Dispel", zone: "sideboard" }],
      [
        { name: "Dispel", zone: "mainboard" },
        { name: "Dispel", zone: "mainboard" },
      ],
    ];
    const expected = {
      similarity: 100,
      shared: [{ name: "Dispel", zone: "mainboard" }],
      differences: [
        [{ name: "Dispel", zone: "mainboard" }],
        [],
        [{ name: "Dispel", zone: "mainboard" }],
      ],
    };

    assert.deepEqual(compare(decks), expected);
  });

  test("returns zero similarity and empty outputs for empty decks", () => {
    const decks: Array<Array<DeckCard>> = [[], []];
    const expected = {
      similarity: 0,
      shared: [],
      differences: [[], []],
    };

    assert.deepEqual(compare(decks), expected);
  });

  test("ignores input zones for shared cards and both differences", () => {
    const decks: Array<Array<DeckCard>> = [
      [
        { name: "Counterspell", zone: "sideboard" },
        { name: "Dispel", zone: "sideboard" },
      ],
      [
        { name: "Counterspell", zone: "mainboard" },
        { name: "Envelop", zone: "sideboard" },
      ],
    ];
    const expected = {
      similarity: 50,
      shared: [{ name: "Counterspell", zone: "mainboard" }],
      differences: [
        [{ name: "Dispel", zone: "mainboard" }],
        [{ name: "Envelop", zone: "mainboard" }],
      ],
    };

    assert.deepEqual(compare(decks), expected);
  });
});
