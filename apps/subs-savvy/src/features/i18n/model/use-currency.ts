export function useCurrency(): string {
  return defaultCurrency;
}

const defaultCurrency = "USD" as const;
