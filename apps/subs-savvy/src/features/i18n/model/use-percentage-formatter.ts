import { useLanguage } from "./use-language.ts";

export function usePercentageFormatter(
  props?: UsePercentageFormatterProps,
): Intl.NumberFormat {
  const language = useLanguage();
  return new Intl.NumberFormat(language, { ...props, style: "percent" });
}

export type UsePercentageFormatterProps = Omit<
  Intl.NumberFormatOptions,
  "style"
>;
