import { styleText } from "node:util";

export function accent(str: string | number): string {
  return styleText(["blue", "bold"], str.toString());
}
