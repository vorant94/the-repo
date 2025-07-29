export const languages = ["en", "ru"] as const;
export type Language = (typeof languages)[number];

export const defaultLang = "en" satisfies Language;

export const languageToLocale = {
  en: "en-US",
  ru: "ru-RU",
} as const satisfies Record<Language, string>;
