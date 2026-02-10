import { describe, expect, it } from "vitest";
import type { DecklistCard } from "./decklist.ts";
import { formatDecklistCard, parseDecklistCard } from "./decklist.ts";

describe("parseDecklistCard", () => {
  it("should parse a valid decklist line", () => {
    const result = parseDecklistCard("4 Lightning Bolt");

    expect(result).toEqual({
      quantity: 4,
      name: "Lightning Bolt",
    });
  });

  it("should return null for empty lines", () => {
    const result = parseDecklistCard("");

    expect(result).toBeNull();
  });

  it("should return null for whitespace-only lines", () => {
    const result = parseDecklistCard("   ");

    expect(result).toBeNull();
  });

  it("should return null for lines without spaces", () => {
    const result = parseDecklistCard("Lightning");

    expect(result).toBeNull();
  });

  it("should return null for non-numeric quantity", () => {
    const result = parseDecklistCard("x Lightning Bolt");

    expect(result).toBeNull();
  });

  it("should return null for zero quantity", () => {
    const result = parseDecklistCard("0 Lightning Bolt");

    expect(result).toBeNull();
  });

  it("should return null for negative quantity", () => {
    const result = parseDecklistCard("-1 Lightning Bolt");

    expect(result).toBeNull();
  });

  it("should return null for empty card name", () => {
    const result = parseDecklistCard("4 ");

    expect(result).toBeNull();
  });

  it("should trim whitespace from card name", () => {
    const result = parseDecklistCard("4   Lightning Bolt   ");

    expect(result).toEqual({
      quantity: 4,
      name: "Lightning Bolt",
    });
  });
});

describe("formatDecklistCard", () => {
  it("should format a decklist card correctly", () => {
    const card: DecklistCard = {
      quantity: 4,
      name: "Lightning Bolt",
    };

    const result = formatDecklistCard(card);

    expect(result).toBe("4 Lightning Bolt");
  });
});
