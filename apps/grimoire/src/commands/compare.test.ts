import assert from "node:assert/strict";
import { test } from "node:test";
import type { DeckCard } from "../schemas/deck.ts";
import { compare } from "./compare.ts";

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

  assert.equal(compare(decks), expected);
});
