import assert from "node:assert/strict";
import { test } from "node:test";
import { countDeckCardsByName, parseDeck } from "../parsers/deck.ts";
import { merge } from "./merge.ts";

test("merges deck lists keeping maximum amount of each card", () => {
  const output = merge([
    countDeckCardsByName(parseDeck("4 Counterspell\n2 Force Spike\n1 Dispel")),
    countDeckCardsByName(parseDeck("1 Counterspell\n2 Dispel\n3 Envelop")),
  ]);

  assert.ok(output.includes("4 Counterspell\n"));
  assert.ok(output.includes("2 Force Spike\n"));
  assert.ok(output.includes("2 Dispel\n"));
  assert.ok(output.includes("3 Envelop\n"));
  assert.equal(output.split("\n").length - 1, 4);
});
