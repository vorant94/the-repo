import { useMemo } from "react";
import { useLanguage } from "./use-language.ts";

export function useRelativeTimeFormatter(): Intl.RelativeTimeFormat {
  const language = useLanguage();

  return useMemo(() => new Intl.RelativeTimeFormat(language), [language]);
}
