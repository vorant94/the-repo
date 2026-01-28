import type { Format } from "../../types.ts";

const MTGDECKS_BASE_URL = "https://mtgdecks.net";

export function buildStaplesUrl(format: Format): string {
  return `${MTGDECKS_BASE_URL}/${format}/staples`;
}
