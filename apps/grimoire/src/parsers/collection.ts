import Papa, { type ParseResult } from "papaparse";
import { z } from "zod";
import type { CardCounts } from "../card-counts.ts";
import {
  type BinderCard,
  binderCardSchema,
  type CollectionCard,
  collectionCardSchema,
  collectionColumns,
} from "../schemas/collection.ts";

export function parseCollection(content: string): Array<CollectionCard> {
  const parsed = parseCsv(content, collectionKeys);
  return z.array(collectionCardSchema).parse(parsed.data);
}

export function parseBinder(content: string): Array<BinderCard> {
  const parsed = parseCsv(content, binderKeys);
  return z.array(binderCardSchema).parse(parsed.data);
}

export function countBinderCardsByName(cards: Array<BinderCard>): CardCounts {
  const counts = new Map<string, number>();
  for (const card of cards) {
    if (card.quantity === 0) {
      continue;
    }
    const quantity = (counts.get(card.name) ?? 0) + card.quantity;
    counts.set(card.name, quantity);
  }
  return counts;
}

const collectionKeys = Object.keys(collectionColumns);
const binderKeys = Object.keys(binderCardSchema.shape);
const columnNames = new Map<string, string>(
  Object.entries(collectionColumns).map(([key, header]) => [header, key]),
);

function parseCsv(
  content: string,
  requiredKeys: Array<string>,
): ParseResult<Record<string, string>> {
  const parsed = Papa.parse<Record<string, string>>(content, {
    delimiter: ",",
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => columnNames.get(header) ?? header,
  });

  if (parsed.errors.length > 0) {
    throw new Error(
      `Invalid collection CSV: ${parsed.errors.map((error) => error.message).join("; ")}`,
    );
  }

  const headers = new Set(parsed.meta.fields);
  for (const key of requiredKeys) {
    if (!headers.has(key)) {
      throw new Error(`Missing collection CSV column: ${key}`);
    }
  }

  return parsed;
}
