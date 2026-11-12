import assert from "node:assert/strict";
import { describe, test } from "node:test";
import dedent from "dedent";
import type { CardCounts } from "../card-counts.ts";
import { formatCardCounts } from "./card-counts.ts";

describe("formatCardCounts", () => {
  test("formats quantities in input order without zones", () => {
    const counts: CardCounts = new Map([
      ["Counterspell", 4],
      ["Dispel", 2],
    ]);
    const expected = dedent`
      4 Counterspell
      2 Dispel
    `;

    assert.equal(formatCardCounts(counts), `${expected}\n`);
  });

  test("formats empty counts as an empty string", () => {
    const counts: CardCounts = new Map();
    const expected = "";

    assert.equal(formatCardCounts(counts), expected);
  });

  test("omits zero quantities", () => {
    const counts: CardCounts = new Map([
      ["Counterspell", 0],
      ["Dispel", 1],
    ]);
    const expected = "1 Dispel\n";

    assert.equal(formatCardCounts(counts), expected);
  });
});
