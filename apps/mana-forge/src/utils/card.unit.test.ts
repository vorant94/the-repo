import { describe, expect, it } from "vitest";
import type { Card } from "./card.ts";
import { formatCard, isBasicLand, parseCollectionFile } from "./card.ts";

const makeCard = (name: string): Card => ({
  quantity: 1,
  name,
  setCode: "",
  collectorNumber: "",
  foil: false,
});

describe("isBasicLand", () => {
  it("returns true for basic lands", () => {
    for (const name of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) {
      expect(isBasicLand(makeCard(name))).toBe(true);
    }
  });

  it("returns true for Wastes and snow-covered basics", () => {
    expect(isBasicLand(makeCard("Wastes"))).toBe(true);
    expect(isBasicLand(makeCard("Snow-Covered Island"))).toBe(true);
  });

  it("returns false for non-basic-land cards", () => {
    expect(isBasicLand(makeCard("Lightning Bolt"))).toBe(false);
    expect(isBasicLand(makeCard("Island Sanctuary"))).toBe(false);
  });
});

describe("formatCard", () => {
  it("omits the set code and collector number when there is no set code", () => {
    expect(formatCard(makeCard("Sol Ring"))).toBe("1 Sol Ring");
  });
});

describe("parseCollectionCard null branches (fall back to simple format)", () => {
  it("rejects an empty card name before the set code", () => {
    expect(parseCollectionFile("1  (m10) 149")[0]?.name).toBe("(m10) 149");
  });

  it("rejects a missing closing paren", () => {
    expect(parseCollectionFile("1 Bolt (m10 149")[0]?.name).toBe(
      "Bolt (m10 149",
    );
  });

  it("rejects an empty set code", () => {
    expect(parseCollectionFile("1 Bolt () 149")[0]?.name).toBe("Bolt () 149");
  });

  it("rejects an empty collector number left after stripping the foil marker", () => {
    expect(parseCollectionFile("1 Bolt (m10) *F*")[0]?.name).toBe(
      "Bolt (m10) *F*",
    );
  });
});

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
