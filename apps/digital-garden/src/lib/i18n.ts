import {
  type DictionaryKey,
  defaultDict,
  defaultLang,
  type Language,
  languageToDict,
} from "../globals/i18n.ts";

export function createTranslate(
  lang: Language | (string & {}) = defaultLang,
): (t: DictionaryKey) => string {
  return (key) => {
    return lang in languageToDict
      ? languageToDict[lang as Language][key]
      : defaultDict[key];
  };
}
