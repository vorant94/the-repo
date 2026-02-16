import { describe, expect, it } from "vitest";
import type { CollectionCard } from "./collection.ts";
import { formatCollectionCard, parseCollectionCard } from "./collection.ts";

describe("formatCollectionCard", () => {
  it("should format a non-foil card correctly", () => {
    const card: CollectionCard = {
      quantity: 1,
      name: "Fiery Temper",
      setCode: "MOM",
      collectorNumber: "142",
      foil: false,
    };

    const result = formatCollectionCard(card);

    expect(result).toBe("1 Fiery Temper (mom) 142");
  });

  it("should format a foil card with *F* marker", () => {
    const card: CollectionCard = {
      quantity: 1,
      name: "Fiery Temper",
      setCode: "MOM",
      collectorNumber: "142",
      foil: true,
    };

    const result = formatCollectionCard(card);

    expect(result).toBe("1 Fiery Temper (mom) 142 *F*");
  });

  it("should lowercase the set code", () => {
    const card: CollectionCard = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "M11",
      collectorNumber: "149",
      foil: false,
    };

    const result = formatCollectionCard(card);

    expect(result).toBe("1 Lightning Bolt (m11) 149");
  });

  it("should handle multi-digit quantities", () => {
    const card: CollectionCard = {
      quantity: 42,
      name: "Mountain",
      setCode: "UNF",
      collectorNumber: "233",
      foil: false,
    };

    const result = formatCollectionCard(card);

    expect(result).toBe("42 Mountain (unf) 233");
  });
});

describe("parseCollectionCard", () => {
  it("parses normal card", () => {
    const result = parseCollectionCard("1 Fiery Temper (mom) 142");
    expect(result).toEqual({
      quantity: 1,
      name: "Fiery Temper",
      setCode: "mom",
      collectorNumber: "142",
      foil: false,
    });
  });

  it("parses foil card", () => {
    const result = parseCollectionCard("1 Lightning Bolt (2xm) 117 *F*");
    expect(result).toEqual({
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "2xm",
      collectorNumber: "117",
      foil: true,
    });
  });

  it("parses card with multiple quantity", () => {
    const result = parseCollectionCard("4 Mountain (m21) 311");
    expect(result).toEqual({
      quantity: 4,
      name: "Mountain",
      setCode: "m21",
      collectorNumber: "311",
      foil: false,
    });
  });

  it("returns null for empty line", () => {
    const result = parseCollectionCard("");
    expect(result).toBeNull();
  });

  it("returns null for whitespace-only line", () => {
    const result = parseCollectionCard("   ");
    expect(result).toBeNull();
  });

  it("returns null for line without set code pattern", () => {
    const result = parseCollectionCard("4 Lightning Bolt");
    expect(result).toBeNull();
  });

  it("returns null for invalid quantity (non-numeric)", () => {
    const result = parseCollectionCard("x Lightning Bolt (2xm) 117");
    expect(result).toBeNull();
  });

  it("returns null for invalid quantity (zero)", () => {
    const result = parseCollectionCard("0 Lightning Bolt (2xm) 117");
    expect(result).toBeNull();
  });

  it("returns null for invalid quantity (negative)", () => {
    const result = parseCollectionCard("-1 Lightning Bolt (2xm) 117");
    expect(result).toBeNull();
  });

  it("returns null for line with missing collector number", () => {
    const result = parseCollectionCard("1 Lightning Bolt (2xm)");
    expect(result).toBeNull();
  });

  it("returns null for line with malformed set code", () => {
    const result = parseCollectionCard("1 Lightning Bolt ( 117");
    expect(result).toBeNull();
  });
});
