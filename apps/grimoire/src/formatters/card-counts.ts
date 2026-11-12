import type { CardCounts } from "../card-counts.ts";

export function formatCardCounts(counts: CardCounts): string {
  const lines: Array<string> = [];
  for (const [name, quantity] of counts) {
    if (quantity <= 0) {
      continue;
    }
    lines.push(`${quantity} ${name}`);
  }

  if (lines.length === 0) {
    return "";
  }
  return `${lines.join("\n")}\n`;
}
