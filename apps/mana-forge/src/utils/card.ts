export interface Card {
  quantity: number;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil: boolean;
}

export const cardKey = (card: Card): string =>
  `${card.name}|${card.setCode}|${card.collectorNumber}|${card.foil}`;

export function formatCard(card: Card): string {
  const setCode = card.setCode.toLowerCase();
  const foilMarker = card.foil ? " *F*" : "";
  return `${card.quantity} ${card.name} (${setCode}) ${card.collectorNumber}${foilMarker}`;
}

export function parseCollectionCard(line: string): Card | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) {
    return null;
  }

  const quantityStr = trimmed.slice(0, firstSpace);
  const quantity = Number.parseInt(quantityStr, 10);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return null;
  }

  const setCodeStart = trimmed.lastIndexOf(" (");
  if (setCodeStart === -1 || setCodeStart <= firstSpace) {
    return null;
  }

  const name = trimmed.slice(firstSpace + 1, setCodeStart).trim();
  if (!name) {
    return null;
  }

  const setCodeEnd = trimmed.indexOf(")", setCodeStart);
  if (setCodeEnd === -1) {
    return null;
  }

  const setCode = trimmed.slice(setCodeStart + 2, setCodeEnd);
  if (!setCode) {
    return null;
  }

  const afterSetCode = trimmed.slice(setCodeEnd + 1).trim();
  if (!afterSetCode) {
    return null;
  }

  const foil = afterSetCode.endsWith("*F*");
  const collectorNumber = foil
    ? afterSetCode.slice(0, -3).trim()
    : afterSetCode;

  if (!collectorNumber) {
    return null;
  }

  return { quantity, name, setCode, collectorNumber, foil };
}

export function parseCollectionFile(content: string): Array<Card> {
  const cards: Array<Card> = [];

  for (const line of content.split("\n")) {
    const card = parseCollectionCard(line);
    if (card) {
      cards.push(card);
    }
  }

  return cards;
}
