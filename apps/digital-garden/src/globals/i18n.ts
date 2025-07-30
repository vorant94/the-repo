export const defaultLang = "en";
export const languages = [defaultLang, "ru"] as const;
export type Language = (typeof languages)[number];

export const defaultDict = {
  "hero.title": "Hi, there, I'm Mordechai! 👋",
  "hero.text.first-paragraph":
    "Welcome to my digital garden, here I write about all sorts of things (mostly about technologies, a little bit on gaming, traveling and self-reflection)",
  "hero.text.second-paragraph.before-strikethrough":
    "Make yourself at home, take a sit and grab something to ",
  "hero.text.second-paragraph.strikethrough": "drink",
  "hero.text.second-paragraph.after-strikethrough": "read",
} as const;
export type DictionaryKey = keyof typeof defaultDict;
export type Dictionary = Record<DictionaryKey, string>;

export const languageToLocale = {
  en: "en-US",
  ru: "ru-RU",
} as const satisfies Record<Language, string>;

export const languageToDict = {
  en: defaultDict,
  ru: {
    "hero.title": "Салют, народ, я Мордехай! 👋",
    "hero.text.first-paragraph":
      "Добро пожаловать в мой личный бложик, тут я пишу о всяком разном (в основном о технологиях, немного об играх, путешествиях и само-рефлексии)",
    "hero.text.second-paragraph.before-strikethrough":
      "Чувствуйте себя как дома, присаживайтесь и возьмите себе что-нибудь ",
    "hero.text.second-paragraph.strikethrough": "выпить",
    "hero.text.second-paragraph.after-strikethrough": "почитать",
  },
} satisfies Record<Language, Dictionary>;
