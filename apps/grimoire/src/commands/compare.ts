import type { CardCounts } from "../card-counts.ts";

interface Comparison {
  similarity: number;
  shared: CardCounts;
  differences: Array<CardCounts>;
}

export function compare(inputs: Array<CardCounts>): Comparison {
  let totalCards = 0;
  let sharedCards = 0;

  for (const input of inputs) {
    for (const [name, quantity] of input) {
      totalCards += quantity;
      if (inputs.every((other) => (other.get(name) ?? 0) > 0)) {
        sharedCards += quantity;
      }
    }
  }

  const shared = new Map<string, number>();
  for (const name of inputs[0]?.keys() ?? []) {
    const quantity = Math.min(...inputs.map((input) => input.get(name) ?? 0));
    if (quantity <= 0) {
      continue;
    }
    shared.set(name, quantity);
  }

  const differences = inputs.map((input) => {
    const difference = new Map<string, number>();
    for (const [name, quantity] of input) {
      const remaining = quantity - (shared.get(name) ?? 0);
      if (remaining <= 0) {
        continue;
      }
      difference.set(name, remaining);
    }

    return difference;
  });

  return {
    similarity: totalCards === 0 ? 0 : (sharedCards / totalCards) * 100,
    shared,
    differences,
  };
}
