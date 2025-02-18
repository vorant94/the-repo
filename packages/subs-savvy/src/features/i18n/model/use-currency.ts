export function useCurrency(): string {
  // TODO connect to user settings currency once it is available

  return defaultCurrency;
}

const defaultCurrency = "USD" as const;
