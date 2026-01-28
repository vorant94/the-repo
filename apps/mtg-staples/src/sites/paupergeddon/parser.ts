import { parseHTML } from "linkedom";

export function parseTop64Cards(html: string): Array<string> {
  const { document } = parseHTML(html);

  const cardElements = document.querySelectorAll("span.card-hover");

  const cardNames = new Set<string>();

  for (const element of cardElements) {
    const text = element.textContent?.trim();
    if (!text) {
      continue;
    }

    // Extract card name by removing quantity prefix (e.g., "4 Fiery Temper" -> "Fiery Temper")
    const parts = text.split(" ");
    const cardName = parts.slice(1).join(" ");
    if (!cardName) {
      continue;
    }

    cardNames.add(cardName);
  }

  return Array.from(cardNames).sort();
}
