import { vi } from "vitest";

export const useCurrency = vi.fn(() => "USD") satisfies () => string;
