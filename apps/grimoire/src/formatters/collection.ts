export interface CollectionCard {
  quantity: number;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil: boolean;
}

// Format a card for Archidekt collection import
// Format: "1 Fiery Temper (mom) 142 *F*"
export function formatCollectionCard(card: CollectionCard): string {
  const setCode = card.setCode.toLowerCase();
  const foilMarker = card.foil ? " *F*" : "";
  return `${card.quantity} ${card.name} (${setCode}) ${card.collectorNumber}${foilMarker}`;
}
