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

const columnNames = new Map<string, string>(
  Object.entries(collectionColumns).map(([key, header]) => [header, key]),
);
