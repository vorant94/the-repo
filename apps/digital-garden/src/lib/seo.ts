import { profile } from "../globals/profile.ts";
import { createTranslate } from "./i18n.ts";

export function getFullTitle(lang?: string, title?: string): string {
  const t = createTranslate(lang);

  return title ? `${title} | ${t(profile.title)}` : t(profile.title);
}
