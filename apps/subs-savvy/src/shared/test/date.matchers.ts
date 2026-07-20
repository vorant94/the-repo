import type { MatchersObject } from "@vitest/expect";
import { isSameDay, isSameMonth, isSameYear } from "date-fns";

type DateUnit = "day" | "month" | "year";

export const dateMatchers = {
  toBeSame(received: Date, expected: Date, unit: DateUnit) {
    const { isNot } = this;

    return {
      pass: isSameByUnit[unit](received, expected),
      message: () =>
        `${received} is${isNot ? " not" : ""} same ${unit} as ${expected}`,
    };
  },
} satisfies MatchersObject;

export type DateMatchers = Record<keyof typeof dateMatchers, DateComparer>;

export type DateComparer = (expected: Date, unit: DateUnit) => void;

const isSameByUnit = {
  day: isSameDay,
  month: isSameMonth,
  year: isSameYear,
} as const satisfies Record<DateUnit, (left: Date, right: Date) => boolean>;
