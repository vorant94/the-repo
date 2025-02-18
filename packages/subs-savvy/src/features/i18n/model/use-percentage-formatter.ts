import { useMemo } from "react";
import { useLanguage } from "./use-language.ts";

export function usePercentageFormatter(
  props?: UsePercentageFormatterProps,
): Intl.NumberFormat {
  const options: Intl.NumberFormatOptions = useMemo(
    () => ({ ...props, style: "percent" }),
    [props],
  );

  const language = useLanguage();
  return useMemo(
    () => new Intl.NumberFormat(language, options),
    [language, options],
  );
}

export type UsePercentageFormatterProps = Omit<
  Intl.NumberFormatOptions,
  "style"
>;
