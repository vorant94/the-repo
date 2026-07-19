import { afterEach, describe, expect, it, vi } from "vitest";
import { loader } from "./scryfall.ts";

describe("Scryfall proxy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("allows the requesting Mana Forge origin", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

    const response = await loader({
      request: new Request(
        "https://mana-forge.vorant94.dev/api/scryfall/cards/search",
        {
          headers: { origin: "https://mana-forge.vorant94.dev" },
        },
      ),
      params: { "*": "cards/search" },
    } as never);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://mana-forge.vorant94.dev",
    );
    expect(response.headers.get("Vary")).toBe("Origin");
  });

  it("allows localhost development origins", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

    const response = await loader({
      request: new Request("http://localhost:5173/api/scryfall/cards/search", {
        headers: { origin: "http://localhost:4173" },
      }),
      params: { "*": "cards/search" },
    } as never);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:4173",
    );
  });

  it("does not allow unrelated origins", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

    const response = await loader({
      request: new Request(
        "https://mana-forge.vorant94.dev/api/scryfall/cards/search",
        {
          headers: { origin: "https://example.com" },
        },
      ),
      params: { "*": "cards/search" },
    } as never);

    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });

  it("returns not found when the Scryfall path is missing", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const response = await loader({
      request: new Request("https://mana-forge.vorant94.dev/api/scryfall"),
      params: {},
    } as never);

    expect(response.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not add CORS headers when no origin was sent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));

    const response = await loader({
      request: new Request(
        "https://mana-forge.vorant94.dev/api/scryfall/cards/search",
      ),
      params: { "*": "cards/search" },
    } as never);

    expect(response.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });
});
