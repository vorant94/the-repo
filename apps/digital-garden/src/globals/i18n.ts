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
  "recent-posts.title": "Recent posts",
  "recent-posts.see-all": "See all",
  "nav.about": "👨 About",
  "nav.posts": "📒 Posts",
  "stay-up-to-date.title": "Stay up to date",
  "stay-up-to-date.text.first-paragraph.before-rss-link":
    "If you wish to be up to date with new posts you can ",
  "stay-up-to-date.text.first-paragraph.rss-link": "subscribe with RSS",
  "stay-up-to-date.text.second-paragraph":
    "There will also be an email newsletter somewhere in the future",
  "social-links.title": "How to reach me",
  "about.title": "About",
  "profile.title": "vorant94's Digital Garden",
  "profile.description": "My personal piece of the Internet",
  "posts.title": "Posts",
  "tags.title": "posts",
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
    "hero.title": "Салют, я Мордехай! 👋",
    "hero.text.first-paragraph":
      "Добро пожаловать в мой бложик, тут я пишу о всяком разном (в основном о технологиях, немного об играх, путешествиях и само-рефлексии)",
    "hero.text.second-paragraph.before-strikethrough":
      "Присаживайся, чувствуй себя как дома и возьми себе что-нибудь ",
    "hero.text.second-paragraph.strikethrough": "выпить",
    "hero.text.second-paragraph.after-strikethrough": "почитать",
    "recent-posts.title": "Недавние посты",
    "recent-posts.see-all": "Посмотреть все",
    "nav.about": "👨 О себе",
    "nav.posts": "📒 Посты",
    "stay-up-to-date.title": "Не пропускай новенькое",
    "stay-up-to-date.text.first-paragraph.before-rss-link":
      "Если хочешь быть в курсе новых постов, есть возможность ",
    "stay-up-to-date.text.first-paragraph.rss-link":
      "подписаться на RSS-рассылку",
    "stay-up-to-date.text.second-paragraph":
      "Также в определенный момент я подрублю email-рассылку",
    "social-links.title": "Мои соц-сетки",
    "about.title": "О себе",
    "profile.title": "vorant94 бложик",
    "profile.description": "Мой личный кусочек Интернета",
    "posts.title": "Посты",
    "tags.title": "посты",
  },
} satisfies Record<Language, Dictionary>;
