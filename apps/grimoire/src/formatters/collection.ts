export interface CollectionCard {
  quantity: number;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil: boolean;
}

// Parse a single collection line
// Format: "1 Fiery Temper (mom) 142 *F*"
// Returns null for unparseable lines
export function parseCollectionCard(line: string): CollectionCard | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Find first space -> quantity
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) {
    return null;
  }

  const quantityStr = trimmed.slice(0, firstSpace);
  const quantity = Number.parseInt(quantityStr, 10);
  if (Number.isNaN(quantity) || quantity <= 0) {
    return null;
  }

  // 2. Find " (" to locate end of card name
  const setCodeStart = trimmed.lastIndexOf(" (");
  if (setCodeStart === -1 || setCodeStart <= firstSpace) {
    return null;
  }

  const name = trimmed.slice(firstSpace + 1, setCodeStart).trim();
  if (!name) {
    return null;
  }

  // 3. Find ")" to extract set code
  const setCodeEnd = trimmed.indexOf(")", setCodeStart);
  if (setCodeEnd === -1) {
    return null;
  }

  const setCode = trimmed.slice(setCodeStart + 2, setCodeEnd);
  if (!setCode) {
    return null;
  }

  // 4. Extract collector number and check for foil
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

// Format a card for Archidekt collection import
// Format: "1 Fiery Temper (mom) 142 *F*"
export function formatCollectionCard(card: CollectionCard): string {
  const setCode = card.setCode.toLowerCase();
  const foilMarker = card.foil ? " *F*" : "";
  return `${card.quantity} ${card.name} (${setCode}) ${card.collectorNumber}${foilMarker}`;
}
