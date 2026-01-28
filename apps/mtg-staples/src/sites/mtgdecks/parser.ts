import { parseHTML } from "linkedom";

export function parseCardNames(html: string): Array<string> {
  const { document } = parseHTML(html);

  const cardNameElements = document.querySelectorAll("b.text-center");

  const cardNames: Array<string> = [];

  for (const element of cardNameElements) {
    const cardName = element.textContent?.trim();
    if (!cardName) {
      continue;
    }

    cardNames.push(cardName);
  }

  return cardNames;
}
