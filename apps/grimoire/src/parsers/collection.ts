import Papa from "papaparse";
import { z } from "zod";
import {
  type CollectionCard,
  collectionCardSchema,
  collectionColumns,
} from "../schemas/collection.ts";

export function parseCollection(content: string): Array<CollectionCard> {
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
  for (const key of Object.keys(collectionColumns)) {
    if (!headers.has(key)) {
      throw new Error(`Missing collection CSV column: ${key}`);
    }
  }

  return z.array(collectionCardSchema).parse(parsed.data);
}

export function formatBinder(cards: Array<CollectionCard>): string {
  const keys = (
    Object.keys(collectionColumns) as Array<keyof CollectionCard>
  ).filter((key) => key !== "binderName" && key !== "binderType");
  const fields = keys.map((key) => collectionColumns[key]);
  const data = cards.map((card) => keys.map((key) => card[key]));
  const output = Papa.unparse({ fields, data }, { newline: "\n" });
  return output.endsWith("\n") ? output : `${output}\n`;
}

const columnNames = new Map<string, string>(
  Object.entries(collectionColumns).map(([key, header]) => [header, key]),
);
