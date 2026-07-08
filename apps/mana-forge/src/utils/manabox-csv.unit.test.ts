import { describe, expect, it } from "vitest";
import { parseManaBoxSelectionCsv } from "./manabox-csv.ts";

describe("parseManaBoxSelectionCsv", () => {
  it("parses rows into cards", () => {
    const content = [
      "Name,Set code,Collector number,Foil,Quantity",
      "Lightning Bolt,m10,149,normal,4",
      "Counterspell,mm2,37,foil,2",
    ].join("\n");

    expect(parseManaBoxSelectionCsv(content)).toEqual([
      {
        quantity: 4,
        name: "Lightning Bolt",
        setCode: "m10",
        collectorNumber: "149",
        foil: false,
      },
      {
        quantity: 2,
        name: "Counterspell",
        setCode: "mm2",
        collectorNumber: "37",
        foil: true,
      },
    ]);
  });

  it('treats only the exact value "foil" as foil', () => {
    const content = [
      "Name,Set code,Collector number,Foil,Quantity",
      "Island,mkm,285,etched,1",
    ].join("\n");

    expect(parseManaBoxSelectionCsv(content)[0]?.foil).toBe(false);
  });

  it("coerces the quantity string to a number", () => {
    const content = [
      "Name,Set code,Collector number,Foil,Quantity",
      "Forest,mkm,287,normal,10",
    ].join("\n");

    expect(parseManaBoxSelectionCsv(content)[0]?.quantity).toBe(10);
  });

  it("returns an empty array when there are no data rows", () => {
    const content = "Name,Set code,Collector number,Foil,Quantity";
    expect(parseManaBoxSelectionCsv(content)).toEqual([]);
  });
});
