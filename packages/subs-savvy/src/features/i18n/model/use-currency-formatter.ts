import { useMemo } from "react";
import { useCurrency } from "./use-currency.ts";
import { useLanguage } from "./use-language.ts";

export function useCurrencyFormatter(
  props: UseCurrencyFormatterProps = {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  },
): Intl.NumberFormat {
  const currency = useCurrency();
  const options: Intl.NumberFormatOptions = useMemo(
    () => ({ ...props, currency, style: "currency" }),
    [props, currency],
  );

  const language = useLanguage();
  return useMemo(
    () => new Intl.NumberFormat(language, options),
    [language, options],
  );
}

export type UseCurrencyFormatterProps = Omit<
  Intl.NumberFormatOptions,
  "currency" | "style"
>;
