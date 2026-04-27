import { beforeEach, describe, expect, it } from "vitest";
import type { Card } from "../utils/card.ts";
import { formatCard } from "../utils/card.ts";
import type { Binder } from "./split.store.ts";
import {
  assignmentId,
  isAssignmentId,
  mergeBinders,
  useSplitStore,
} from "./split.store.ts";

describe("isAssignmentId", () => {
  it("returns true for valid assignment ids", () => {
    expect(isAssignmentId("collection")).toBe(true);
    expect(isAssignmentId("tradeOnly")).toBe(true);
    expect(isAssignmentId("tradeOrBuy")).toBe(true);
    expect(isAssignmentId("bulk")).toBe(true);
  });

  it("returns false for invalid strings", () => {
    expect(isAssignmentId("invalid")).toBe(false);
    expect(isAssignmentId("")).toBe(false);
    expect(isAssignmentId("Collection")).toBe(false);
  });
});

describe("formatCard", () => {
  it("formats a non-foil card", () => {
    const card: Card = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "m10",
      collectorNumber: "149",
      foil: false,
    };
    expect(formatCard(card)).toBe("1 Lightning Bolt (m10) 149");
  });

  it("formats a foil card", () => {
    const card: Card = {
      quantity: 2,
      name: "Counterspell",
      setCode: "mm2",
      collectorNumber: "37",
      foil: true,
    };
    expect(formatCard(card)).toBe("2 Counterspell (mm2) 37 *F*");
  });

  it("lowercases the set code", () => {
    const card: Card = {
      quantity: 1,
      name: "Lightning Bolt",
      setCode: "M10",
      collectorNumber: "149",
      foil: false,
    };
    expect(formatCard(card)).toBe("1 Lightning Bolt (m10) 149");
  });
});

describe("mergeBinders", () => {
  it("returns empty array for empty input", () => {
    expect(mergeBinders([])).toEqual([]);
  });

  it("returns cards from a single binder", () => {
    const binder: Binder = {
      id: "MyBinderbinder",
      name: "My Binder",
      binderType: "binder",
      cards: [
        {
          quantity: 1,
          name: "Lightning Bolt",
          setCode: "m10",
          collectorNumber: "149",
          foil: false,
        },
      ],
      cardCount: 1,
    };
    const result = mergeBinders([binder]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: "Lightning Bolt", quantity: 1 });
  });

  it("aggregates quantities for duplicate cards across binders", () => {
    const card: Card = {
      quantity: 2,
      name: "Lightning Bolt",
      setCode: "m10",
      collectorNumber: "149",
      foil: false,
    };
    const binder1: Binder = {
      id: "binder1",
      name: "Binder 1",
      binderType: "binder",
      cards: [card],
      cardCount: 2,
    };
    const binder2: Binder = {
      id: "binder2",
      name: "Binder 2",
      binderType: "binder",
      cards: [{ ...card, quantity: 3 }],
      cardCount: 3,
    };
    const result = mergeBinders([binder1, binder2]);
    expect(result).toHaveLength(1);
    expect(result[0]?.quantity).toBe(5);
  });
});

describe("useSplitStore", () => {
  beforeEach(() => {
    useSplitStore.getState().reset();
  });

  describe("parseCollection", () => {
    it("parses valid CSV and creates binders by name and type", () => {
      const csv = [
        "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
        "My Binder,binder,Lightning Bolt,m10,149,,1",
        "My Deck,deck,Counterspell,mm2,37,,2",
      ].join("\n");

      useSplitStore.getState().parseCollection(csv);
      const { assignments } = useSplitStore.getState();
      expect(assignments.collection).toHaveLength(2);

      const binder = assignments.collection.find((b) => b.name === "My Binder");
      expect(binder).toBeDefined();
      expect(binder?.binderType).toBe("binder");
      expect(binder?.cards).toHaveLength(1);

      const deck = assignments.collection.find((b) => b.name === "My Deck");
      expect(deck).toBeDefined();
      expect(deck?.binderType).toBe("deck");
    });

    it("aggregates card counts within same binder", () => {
      const csv = [
        "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
        "My Binder,binder,Lightning Bolt,m10,149,,1",
        "My Binder,binder,Counterspell,mm2,37,,2",
      ].join("\n");

      useSplitStore.getState().parseCollection(csv);
      const { assignments } = useSplitStore.getState();
      expect(assignments.collection).toHaveLength(1);
      expect(assignments.collection[0]?.cardCount).toBe(3);
      expect(assignments.collection[0]?.cards).toHaveLength(2);
    });

    it("parses foil field correctly", () => {
      const csv = [
        "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
        "My Binder,binder,Lightning Bolt,m10,149,foil,1",
        "My Binder,binder,Counterspell,mm2,37,,1",
      ].join("\n");

      useSplitStore.getState().parseCollection(csv);
      const { assignments } = useSplitStore.getState();
      const binder = assignments.collection[0];
      const foilCard = binder?.cards.find((c) => c.name === "Lightning Bolt");
      const nonFoilCard = binder?.cards.find((c) => c.name === "Counterspell");
      expect(foilCard?.foil).toBe(true);
      expect(nonFoilCard?.foil).toBe(false);
    });
  });

  describe("moveBinder", () => {
    it("moves binder from one assignment to another", () => {
      const csv = [
        "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
        "My Binder,binder,Lightning Bolt,m10,149,,1",
      ].join("\n");

      useSplitStore.getState().parseCollection(csv);
      const binder = useSplitStore.getState().assignments.collection[0];
      expect(binder).toBeDefined();

      useSplitStore
        .getState()
        .moveBinder(
          binder?.id ?? "",
          assignmentId.collection,
          assignmentId.tradeOnly,
        );

      const { assignments } = useSplitStore.getState();
      expect(assignments.collection).toHaveLength(0);
      expect(assignments.tradeOnly).toHaveLength(1);
      expect(assignments.tradeOnly[0]?.id).toBe(binder?.id);
    });

    it("handles missing binder gracefully", () => {
      useSplitStore
        .getState()
        .moveBinder(
          "nonexistent",
          assignmentId.collection,
          assignmentId.tradeOnly,
        );
      const { assignments } = useSplitStore.getState();
      expect(assignments.collection).toHaveLength(0);
      expect(assignments.tradeOnly).toHaveLength(0);
    });
  });
});
