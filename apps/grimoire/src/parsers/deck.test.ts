import assert from "node:assert/strict";
import { test } from "node:test";
import { countDeckCardsByName, parseDeck, parseDeckLine } from "./deck.ts";

test("parses the deck with different cards", () => {
  const parsed = parseDeck("4 Counterspell\n2 Force Spike\n1 Dispel");

  assert.deepEqual(parsed, [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Force Spike", zone: "mainboard" },
    { name: "Force Spike", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
  ]);
});

test("parses the deck with empty lines", () => {
  const parsed = parseDeck("4 Counterspell\n\n1 Dispel");

  assert.deepEqual(parsed, [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
  ]);
});

test("preserves individual cards from multiple entries of the same name", () => {
  const parsed = parseDeck("2 Counterspell\n1 Counterspell\n1 Dispel");

  assert.deepEqual(parsed, [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Dispel", zone: "mainboard" },
  ]);
});

test("returns null for empty line", () => {
  assert.equal(parseDeckLine(""), null);
});

test("returns null for category line", () => {
  assert.equal(parseDeckLine("Sideboard"), null);
});

test("returns null for card without amount but with spaces", () => {
  assert.equal(parseDeckLine("Force Spike"), null);
});

test("parses line with amount", () => {
  assert.deepEqual(parseDeckLine("4 Counterspell"), [
    "Counterspell",
    "Counterspell",
    "Counterspell",
    "Counterspell",
  ]);
});

test("parses line with multi word name", () => {
  assert.deepEqual(parseDeckLine("2 Force Spike"), [
    "Force Spike",
    "Force Spike",
  ]);
});

test("counts cards in deck by name", () => {
  const counts = countDeckCardsByName([
    { name: "Counterspell", zone: "mainboard" },
    { name: "Force Spike", zone: "mainboard" },
    { name: "Counterspell", zone: "sideboard" },
  ]);

  assert.equal(counts.size, 2);
  assert.equal(counts.get("Counterspell"), 2);
  assert.equal(counts.get("Force Spike"), 1);
});

test("preserves mainboard and sideboard assignments for copies of the same card", () => {
  const parsed = parseDeck(
    "2 Counterspell\r\n\r\nSideboard\r\n1 Counterspell\r\n2 Dispel",
  );

  assert.deepEqual(parsed, [
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "mainboard" },
    { name: "Counterspell", zone: "sideboard" },
    { name: "Dispel", zone: "sideboard" },
    { name: "Dispel", zone: "sideboard" },
  ]);
});
