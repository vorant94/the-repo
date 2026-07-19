import { queryClient } from "../globals/query-client.ts";

const scryfallSearchUrl = "/api/scryfall/cards/search";

export interface ScryfallSetCard {
  name: string;
  setName: string;
}

interface ScryfallCardResponse {
  name: string;
  // biome-ignore lint/style/useNamingConvention: Scryfall API response field
  set_name: string;
}

interface ScryfallSearchResponse {
  data: Array<ScryfallCardResponse>;
  // biome-ignore lint/style/useNamingConvention: Scryfall API response field
  has_more: boolean;
  // biome-ignore lint/style/useNamingConvention: Scryfall API response field
  next_page?: string;
}

export function getSetCards(setCode: string): Promise<Array<ScryfallSetCard>> {
  const normalizedSetCode = setCode.toLowerCase();

  return queryClient.fetchQuery({
    queryKey: ["scryfall", "set", normalizedSetCode],
    queryFn: () => fetchSetCards(normalizedSetCode),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

async function fetchSetCards(setCode: string): Promise<Array<ScryfallSetCard>> {
  const cards: Array<ScryfallSetCard> = [];
  let url = `${scryfallSearchUrl}?q=${encodeURIComponent(`set:${setCode}`)}&unique=cards`;

  while (url) {
    const response = await fetch(url);

    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      throw new Error(`Scryfall search failed for ${setCode}.`);
    }

    const result = (await response.json()) as ScryfallSearchResponse;
    cards.push(
      ...result.data.map((card) => ({
        name: card.name,
        setName: card.set_name,
      })),
    );

    url = result.has_more && result.next_page ? proxyUrl(result.next_page) : "";
  }

  return cards;
}

function proxyUrl(url: string): string {
  const nextPage = new URL(url);
  return `/api/scryfall${nextPage.pathname}${nextPage.search}`;
}
