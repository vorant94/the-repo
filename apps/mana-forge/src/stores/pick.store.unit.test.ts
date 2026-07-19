import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSetCards } from "../api/scryfall.ts";
import { usePickStore } from "./pick.store.ts";

vi.mock(import("../api/scryfall.ts"), () => ({
  getSetCards: vi.fn(),
}));

describe("usePickStore", () => {
  beforeEach(() => {
    usePickStore.getState().reset();
    vi.mocked(getSetCards).mockReset();
  });

  it("ranks sets by the number of wishlist cards they contain", async () => {
    vi.mocked(getSetCards)
      .mockResolvedValueOnce([
        { name: "Sheoldred, the Apocalypse", setName: "Dominaria United" },
        { name: "Liliana of the Veil", setName: "Dominaria United" },
        { name: "Evolved Sleeper", setName: "Dominaria United" },
      ])
      .mockResolvedValueOnce([
        { name: "Liliana of the Veil", setName: "Innistrad" },
        { name: "Delver of Secrets", setName: "Innistrad" },
      ]);

    usePickStore
      .getState()
      .setWishlistText("Sheoldred, the Apocalypse\nLiliana of the Veil");
    usePickStore.getState().setSetCodesText("dmu\ninn");

    await usePickStore.getState().recommend();

    expect(getSetCards).toHaveBeenCalledWith("dmu");
    expect(getSetCards).toHaveBeenCalledWith("inn");
    expect(usePickStore.getState().recommendations).toEqual([
      {
        setCode: "dmu",
        setName: "Dominaria United",
        matchedCardNames: ["Liliana of the Veil", "Sheoldred, the Apocalypse"],
        overlap: 100,
      },
      {
        setCode: "inn",
        setName: "Innistrad",
        matchedCardNames: ["Liliana of the Veil"],
        overlap: 50,
      },
    ]);
  });

  it("keeps sets with no matching wishlist cards", async () => {
    vi.mocked(getSetCards).mockResolvedValue([
      { name: "Delver of Secrets", setName: "Innistrad" },
    ]);
    usePickStore.getState().setWishlistText("Ponder");
    usePickStore.getState().setSetCodesText("inn");

    await usePickStore.getState().recommend();

    expect(usePickStore.getState().recommendations[0]).toMatchObject({
      setName: "Innistrad",
      overlap: 0,
      matchedCardNames: [],
    });
  });

  it("reports incomplete input without requesting cards", async () => {
    await usePickStore.getState().recommend();

    expect(getSetCards).not.toHaveBeenCalled();
    expect(usePickStore.getState().error).toBe(
      "Add at least one wishlist card and one set code.",
    );
  });

  it("does not request the same set code twice", async () => {
    vi.mocked(getSetCards).mockResolvedValue([]);
    usePickStore.getState().setWishlistText("Ponder");
    usePickStore.getState().setSetCodesText("M10\nm10");

    await usePickStore.getState().recommend();

    expect(getSetCards).toHaveBeenCalledTimes(1);
  });
});
