import { useCurrency } from "./use-currency.ts";
import { useLanguage } from "./use-language.ts";

export function useCurrencyFormatter(
  props: UseCurrencyFormatterProps = {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  },
): Intl.NumberFormat {
  const currency = useCurrency();
  const language = useLanguage();
  return Intl.NumberFormat(language, { ...props, currency, style: "currency" });
}

export type UseCurrencyFormatterProps = Omit<
  Intl.NumberFormatOptions,
  "currency" | "style"
>;
