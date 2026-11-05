import assert from "node:assert/strict";
import { describe, test } from "node:test";
import dedent from "dedent";
import type { DeckCard } from "../schemas/deck.ts";
import { formatDeck } from "./deck.ts";

describe("formatDeck", () => {
  test("formats card counts separately for mainboard and sideboard", () => {
    const deck: Array<DeckCard> = [
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "mainboard" },
      { name: "Counterspell", zone: "sideboard" },
      { name: "Dispel", zone: "sideboard" },
    ];
    const expected = dedent`
    2 Counterspell

    Sideboard
    1 Counterspell
    1 Dispel
  `;

    assert.equal(formatDeck(deck), `${expected}\n`);
  });

  test("formats a sideboard-only deck without a leading blank line", () => {
    const deck: Array<DeckCard> = [
      { name: "Dispel", zone: "sideboard" },
      { name: "Dispel", zone: "sideboard" },
    ];
    const expected = dedent`
    Sideboard
    2 Dispel
  `;

    assert.equal(formatDeck(deck), `${expected}\n`);
  });

  test("formats an empty deck as an empty string", () => {
    const deck: Array<DeckCard> = [];
    const expected = "";

    assert.equal(formatDeck(deck), expected);
  });
});
