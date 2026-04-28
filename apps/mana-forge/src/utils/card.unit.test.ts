import { describe, expect, it } from "vitest";
import type { Card } from "./card.ts";
import { formatCard, parseCollectionFile } from "./card.ts";

describe("formatCard / parseCollectionFile round-trip", () => {
  it("round-trips a non-foil card", () => {
    const card: Card = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "m10",
      collectorNumber: "149",
      foil: false,
    };
    expect(parseCollectionFile(formatCard(card))[0]).toEqual(card);
  });

  it("round-trips a foil card", () => {
    const card: Card = {
      quantity: 2,
      name: "Counterspell",
      setCode: "mm2",
      collectorNumber: "37",
      foil: true,
    };
    expect(parseCollectionFile(formatCard(card))[0]).toEqual(card);
  });

  it("round-trips a card with uppercase set code (lowercased by format)", () => {
    const card: Card = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "M10",
      collectorNumber: "149",
      foil: false,
    };
    expect(parseCollectionFile(formatCard(card))[0]).toEqual({
      ...card,
      setCode: "m10",
    });
  });
});

describe("parseCollectionCard (via parseCollectionFile)", () => {
  it("returns null for empty line", () => {
    expect(parseCollectionFile("")).toEqual([]);
    expect(parseCollectionFile("   ")).toEqual([]);
  });

  it("returns null for line without quantity", () => {
    expect(parseCollectionFile("Lightning Bolt (m10) 149")).toEqual([]);
  });

  it("falls back to simple format for line without set code parens", () => {
    const result = parseCollectionFile("1 Lightning Bolt m10 149");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      quantity: 1,
      name: "Lightning Bolt m10 149",
      setCode: "",
    });
  });

  it("falls back to simple format for line without collector number", () => {
    const result = parseCollectionFile("1 Lightning Bolt (m10)");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      quantity: 1,
      name: "Lightning Bolt (m10)",
      setCode: "",
    });
  });

  it("returns null for zero quantity", () => {
    expect(parseCollectionFile("0 Lightning Bolt (m10) 149")).toEqual([]);
  });

  it("returns null for negative quantity", () => {
    expect(parseCollectionFile("-1 Lightning Bolt (m10) 149")).toEqual([]);
  });
});

describe("parseSimpleDecklistCard (via parseCollectionFile)", () => {
  it("returns null for empty line", () => {
    expect(parseCollectionFile("")).toEqual([]);
    expect(parseCollectionFile("   ")).toEqual([]);
  });

  it("returns null for line without quantity", () => {
    expect(parseCollectionFile("Counterspell")).toEqual([]);
  });

  it("returns null for line with quantity but no name", () => {
    expect(parseCollectionFile("4 ")).toEqual([]);
  });

  it("returns null for zero quantity", () => {
    expect(parseCollectionFile("0 Counterspell")).toEqual([]);
  });

  it("returns null for negative quantity", () => {
    expect(parseCollectionFile("-1 Counterspell")).toEqual([]);
  });

  it("parses valid quantity-name line", () => {
    const result = parseCollectionFile("4 Counterspell");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      quantity: 4,
      name: "Counterspell",
      setCode: "",
      collectorNumber: "",
      foil: false,
    });
  });

  it("parses multi-word card name", () => {
    const result = parseCollectionFile("1 Gurmag Angler");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ quantity: 1, name: "Gurmag Angler" });
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

  it("parses simple quantity-name format without set code", () => {
    const content = "4 Counterspell\n2 Lightning Bolt";
    const result = parseCollectionFile(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      quantity: 4,
      name: "Counterspell",
      setCode: "",
      collectorNumber: "",
    });
    expect(result[1]).toMatchObject({
      quantity: 2,
      name: "Lightning Bolt",
      setCode: "",
      collectorNumber: "",
    });
  });
});
