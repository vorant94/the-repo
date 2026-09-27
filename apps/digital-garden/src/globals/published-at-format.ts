import { format } from "date-fns";
import { ru } from "date-fns/locale";

type PublishedAtStyle = "full" | "short";

export const publishedAtFormat = {
  full: "MMM dd, yyyy",
  short: "MMM dd",
  year: "yyyy",
} as const;

export function formatPublishedAt(
  date: Date,
  style: PublishedAtStyle,
  language?: string,
): string {
  if (language === "ru") {
    return format(date, russianFormats[style], { locale: ru });
  }

  return format(date, publishedAtFormat[style]);
}

const russianFormats = {
  full: "d MMM yyyy",
  short: "d MMM",
} as const satisfies Record<PublishedAtStyle, string>;
