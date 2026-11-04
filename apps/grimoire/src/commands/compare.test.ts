import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDeck } from "../parsers/deck.ts";
import { compare } from "./compare.ts";

test("compares deck lists and calculates deck similarity percentage", () => {
  const output = compare([
    parseDeck("1 Counterspell\n1 Force Spike\n1 Dispel"),
    parseDeck("1 Counterspell\n1 Force of Negation\n1 Envelop"),
    parseDeck("1 Counterspell\n1 Spell Pierce\n1 Blue Elemental Blast"),
  ]);

  assert.ok(output.includes("Deck similarity: 33.33%\n"));
});
