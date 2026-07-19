import { afterEach, describe, expect, it, vi } from "vitest";
import { getSetCards } from "./scryfall.ts";

describe("getSetCards", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests every card in a set without including wishlist names", async () => {
    const fetch = vi.fn().mockResolvedValue(
      scryfallResponse({
        data: [{ name: "Ponder", setName: "Magic 2010" }],
        hasMore: false,
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await getSetCards("m10");

    expect(fetch).toHaveBeenCalledWith(
      "/api/scryfall/cards/search?q=set%3Am10&unique=cards",
    );
  });

  it("follows subsequent Scryfall pages through the proxy", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        scryfallResponse({
          data: [{ name: "Lightning Bolt", setName: "Magic 2010" }],
          hasMore: true,
          nextPage: "https://api.scryfall.com/cards/search?page=2",
        }),
      )
      .mockResolvedValueOnce(
        scryfallResponse({
          data: [{ name: "Ponder", setName: "Magic 2010" }],
          hasMore: false,
        }),
      );
    vi.stubGlobal("fetch", fetch);

    await expect(getSetCards("m11")).resolves.toEqual([
      { name: "Lightning Bolt", setName: "Magic 2010" },
      { name: "Ponder", setName: "Magic 2010" },
    ]);
    expect(fetch).toHaveBeenLastCalledWith("/api/scryfall/cards/search?page=2");
  });

  it("returns a cached set response for repeat requests", async () => {
    const fetch = vi.fn().mockResolvedValue(
      scryfallResponse({
        data: [{ name: "Lightning Bolt", setName: "Magic 2012" }],
        hasMore: false,
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await getSetCards("m12");
    await getSetCards("M12");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns no cards when Scryfall does not recognize a set", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(getSetCards("unknown")).resolves.toEqual([]);
  });

  it("throws when Scryfall returns an unexpected error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    await expect(getSetCards("error")).rejects.toThrow(
      "Scryfall search failed for error.",
    );
  });
});

interface ScryfallResponseFixture {
  data: Array<{ name: string; setName: string }>;
  hasMore: boolean;
  nextPage?: string;
}

function scryfallResponse(fixture: ScryfallResponseFixture): Response {
  return new Response(
    JSON.stringify({
      data: fixture.data.map((card) => ({
        name: card.name,
        // biome-ignore lint/style/useNamingConvention: Scryfall API response field
        set_name: card.setName,
      })),
      // biome-ignore lint/style/useNamingConvention: Scryfall API response field
      has_more: fixture.hasMore,
      // biome-ignore lint/style/useNamingConvention: Scryfall API response field
      next_page: fixture.nextPage,
    }),
    { status: 200 },
  );
}
