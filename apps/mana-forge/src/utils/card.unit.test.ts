import { describe, expect, it } from "vitest";
import type { Card } from "./card.ts";
import {
  formatCard,
  parseCollectionCard,
  parseCollectionFile,
} from "./card.ts";

describe("formatCard / parseCollectionCard round-trip", () => {
  it("round-trips a non-foil card", () => {
    const card: Card = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "m10",
      collectorNumber: "149",
      foil: false,
    };
    expect(parseCollectionCard(formatCard(card))).toEqual(card);
  });

  it("round-trips a foil card", () => {
    const card: Card = {
      quantity: 2,
      name: "Counterspell",
      setCode: "mm2",
      collectorNumber: "37",
      foil: true,
    };
    expect(parseCollectionCard(formatCard(card))).toEqual(card);
  });

  it("round-trips a card with uppercase set code (lowercased by format)", () => {
    const card: Card = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "M10",
      collectorNumber: "149",
      foil: false,
    };
    const roundTripped = parseCollectionCard(formatCard(card));
    expect(roundTripped).toEqual({ ...card, setCode: "m10" });
  });
});

describe("parseCollectionCard", () => {
  it("returns null for empty line", () => {
    expect(parseCollectionCard("")).toBeNull();
    expect(parseCollectionCard("   ")).toBeNull();
  });

  it("returns null for line without quantity", () => {
    expect(parseCollectionCard("Lightning Bolt (m10) 149")).toBeNull();
  });

  it("returns null for line without set code parens", () => {
    expect(parseCollectionCard("1 Lightning Bolt m10 149")).toBeNull();
  });

  it("returns null for line without collector number", () => {
    expect(parseCollectionCard("1 Lightning Bolt (m10)")).toBeNull();
  });

  it("returns null for zero quantity", () => {
    expect(parseCollectionCard("0 Lightning Bolt (m10) 149")).toBeNull();
  });

  it("returns null for negative quantity", () => {
    expect(parseCollectionCard("-1 Lightning Bolt (m10) 149")).toBeNull();
  });
});

describe("parseCollectionFile", () => {
  it("parses multiple lines", () => {
    const content = "1 Lightning Bolt (m10) 149\n2 Counterspell (mm2) 37";
    const result = parseCollectionFile(content);
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("Lightning Bolt");
    expect(result[1]?.name).toBe("Counterspell");
  });

  it("skips invalid lines", () => {
    const content = "invalid\n1 Lightning Bolt (m10) 149\nalso invalid";
    const result = parseCollectionFile(content);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Lightning Bolt");
  });

  it("returns empty array for empty content", () => {
    expect(parseCollectionFile("")).toEqual([]);
  });
});
