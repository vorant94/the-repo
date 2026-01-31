import { describe, expect, it } from "vitest";
import type { CollectionCard } from "./collection.ts";
import { formatCollectionCard } from "./collection.ts";

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
