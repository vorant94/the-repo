import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDeck } from "./deck.ts";

test("parses the deck with different cards", () => {
  const parsed = parseDeck("4 Counterspell\n2 Force Spike\n1 Dispel");

  assert.deepEqual(
    parsed,
    new Map([
      ["Counterspell", 4],
      ["Force Spike", 2],
      ["Dispel", 1],
    ]),
  );
});

test("parses the deck with empty lines", () => {
  const parsed = parseDeck("4 Counterspell\n\n1 Dispel");

  assert.deepEqual(
    parsed,
    new Map([
      ["Counterspell", 4],
      ["Dispel", 1],
    ]),
  );
});

test("preserves individual cards from multiple entries of the same name", () => {
  const parsed = parseDeck("2 Counterspell\n1 Counterspell\n1 Dispel");

  assert.deepEqual(
    parsed,
    new Map([
      ["Counterspell", 3],
      ["Dispel", 1],
    ]),
  );
});

// The Node parser exposes card counts directly, so skipped lines yield an empty map.
test("returns null for empty line", () => {
  assert.deepEqual(parseDeck(""), new Map());
});

test("returns null for category line", () => {
  assert.deepEqual(parseDeck("Sideboard"), new Map());
});

test("returns null for card without amount but with spaces", () => {
  assert.deepEqual(parseDeck("Force Spike"), new Map());
});

test("parses line with amount", () => {
  assert.deepEqual(parseDeck("4 Counterspell"), new Map([["Counterspell", 4]]));
});

test("parses line with multi word name", () => {
  assert.deepEqual(parseDeck("2 Force Spike"), new Map([["Force Spike", 2]]));
});

test("counts cards in deck by name", () => {
  const counts = parseDeck(
    "1 Counterspell\n1 Force Spike\nSideboard\n1 Counterspell",
  );

  assert.equal(counts.size, 2);
  assert.equal(counts.get("Counterspell"), 2);
  assert.equal(counts.get("Force Spike"), 1);
});
