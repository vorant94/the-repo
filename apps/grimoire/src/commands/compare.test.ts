import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { CardCounts } from "../card-counts.ts";
import { compare } from "./compare.ts";

describe("compare", () => {
  test("compares deck lists and calculates deck similarity percentage", () => {
    const inputs: Array<CardCounts> = [
      new Map([
        ["Counterspell", 1],
        ["Force Spike", 1],
        ["Dispel", 1],
      ]),
      new Map([
        ["Counterspell", 1],
        ["Force of Negation", 1],
        ["Envelop", 1],
      ]),
      new Map([
        ["Counterspell", 1],
        ["Spell Pierce", 1],
        ["Blue Elemental Blast", 1],
      ]),
    ];
    const expected = (3 / 9) * 100;

    assert.equal(compare(inputs).similarity, expected);
  });

  test("separates matching copies, surplus copies, and unique cards", () => {
    const inputs: Array<CardCounts> = [
      new Map([
        ["Counterspell", 4],
        ["Dispel", 1],
      ]),
      new Map([
        ["Counterspell", 2],
        ["Envelop", 1],
      ]),
    ];
    const original = structuredClone(inputs);
    const expected = {
      similarity: 75,
      shared: new Map([["Counterspell", 2]]),
      differences: [
        new Map([
          ["Counterspell", 2],
          ["Dispel", 1],
        ]),
        new Map([["Envelop", 1]]),
      ],
    };

    assert.deepEqual(compare(inputs), expected);
    assert.deepEqual(inputs, original);
  });

  test("returns all cards as differences when one deck is empty", () => {
    const inputs: Array<CardCounts> = [new Map(), new Map([["Dispel", 1]])];
    const expected = {
      similarity: 0,
      shared: new Map(),
      differences: [new Map(), new Map([["Dispel", 1]])],
    };

    assert.deepEqual(compare(inputs), expected);
  });

  test("returns empty differences for identical decks", () => {
    const inputs: Array<CardCounts> = [
      new Map([["Dispel", 1]]),
      new Map([["Dispel", 1]]),
    ];
    const expected = {
      similarity: 100,
      shared: new Map([["Dispel", 1]]),
      differences: [new Map(), new Map()],
    };

    assert.deepEqual(compare(inputs), expected);
  });

  test("uses the minimum shared quantity across all decks", () => {
    const inputs: Array<CardCounts> = [
      new Map([["Dispel", 2]]),
      new Map([["Dispel", 1]]),
      new Map([["Dispel", 2]]),
    ];
    const expected = {
      similarity: 100,
      shared: new Map([["Dispel", 1]]),
      differences: [
        new Map([["Dispel", 1]]),
        new Map(),
        new Map([["Dispel", 1]]),
      ],
    };

    assert.deepEqual(compare(inputs), expected);
  });

  test("returns zero similarity and empty outputs for empty decks", () => {
    const inputs: Array<CardCounts> = [new Map(), new Map()];
    const expected = {
      similarity: 0,
      shared: new Map(),
      differences: [new Map(), new Map()],
    };

    assert.deepEqual(compare(inputs), expected);
  });

  test("treats zero quantities as absent", () => {
    const inputs: Array<CardCounts> = [
      new Map([["Counterspell", 2]]),
      new Map([["Counterspell", 0]]),
    ];
    const expected = {
      similarity: 0,
      shared: new Map(),
      differences: [new Map([["Counterspell", 2]]), new Map()],
    };

    assert.deepEqual(compare(inputs), expected);
  });
});
