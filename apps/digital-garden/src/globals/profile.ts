import type { DictionaryKey } from "./i18n.ts";

export const profile = {
  title: "profile.title",
  description: "profile.description",
} as const satisfies Record<string, DictionaryKey>;
