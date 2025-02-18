import { vi } from "vitest";
import type { SupportedLanguage } from "../use-language.ts";

export const useLanguage = vi.fn(
  () => "en" as const,
) satisfies () => SupportedLanguage;
