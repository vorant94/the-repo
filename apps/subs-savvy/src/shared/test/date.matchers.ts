import type { MatchersObject } from "@vitest/expect";
import dayjs, { type OpUnitType } from "dayjs";

export const dateMatchers = {
  toBeSame(received: Date, expected: Date, unit: OpUnitType) {
    const { isNot } = this;

    return {
      pass: dayjs(received).isSame(expected, unit),
      message: () =>
        `${received} is${isNot ? " not" : ""} same ${unit} as ${expected}`,
    };
  },
} satisfies MatchersObject;

export type DateMatchers = Record<keyof typeof dateMatchers, DateComparer>;

export type DateComparer = (expected: Date, unit: OpUnitType) => void;
