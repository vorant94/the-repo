import Papa from "papaparse";
import {
  type CollectionCard,
  collectionColumns,
} from "../schemas/collection.ts";

export function formatBinder(cards: Array<CollectionCard>): string {
  const data = cards.map((card) => keys.map((key) => card[key]));
  const output = Papa.unparse({ fields, data }, { newline: "\n" });
  return output.endsWith("\n") ? output : `${output}\n`;
}

const keys = (
  Object.keys(collectionColumns) as Array<keyof CollectionCard>
).filter((key) => key !== "binderName" && key !== "binderType");
const fields = keys.map((key) => collectionColumns[key]);
