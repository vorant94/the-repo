import { useLanguage } from "./use-language.ts";

export function useRelativeTimeFormatter(): Intl.RelativeTimeFormat {
  const language = useLanguage();
  return new Intl.RelativeTimeFormat(language);
}
