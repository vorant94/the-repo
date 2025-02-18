import "vitest";
import type { TypeOptions } from "i18next";
import type { db } from "./shared/lib/db.ts";
import type { Translation } from "./shared/lib/translation.ts";
import type { DateMatchers } from "./shared/test/date.matchers.ts";

declare global {
  interface Window {
    db: typeof db;
  }
}

declare module "vitest" {
  interface Assertion extends DateMatchers {}
  interface AsymmetricMatchersContaining extends DateMatchers {}
}

declare module "i18next" {
  interface CustomTypeOptions {
    resources: CustomResources;
  }

  interface CustomResources
    extends Record<TypeOptions["defaultNS"], Translation> {}
}
