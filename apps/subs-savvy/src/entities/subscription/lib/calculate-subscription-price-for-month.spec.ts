import { addYears, setMonth, subYears } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  monthlySubscription,
  twoMonthlySubscription,
  twoYearlySubscription,
  yearlySubscription,
} from "../../../shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { startOfYear } from "../../../shared/lib/dates.ts";
import { calculateSubscriptionPriceForMonth } from "./calculate-subscription-price-for-month.ts";

describe("monthly", () => {
  it("startedAtMonth < month && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 3),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth < month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(monthlySubscription.startedAt, 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 3),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth = month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(monthlySubscription.startedAt, 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(subscription.price);
  });

  it("month < startedAtMonth && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(monthlySubscription.startedAt, 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 1),
      ),
    ).toEqual(0);
  });

  it("month < startedAtMonth && year < startedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(addYears(monthlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 1),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < endedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      endedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 6),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 9),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      endedAt: setMonth(monthlySubscription.startedAt, 6),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 9),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month = endedAtMonth && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      endedAt: setMonth(monthlySubscription.startedAt, 9),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 9),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month < endedAtMonth && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      endedAt: setMonth(monthlySubscription.startedAt, 9),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 6),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth < month < endedAtMonth && startedAtYear < year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      endedAt: setMonth(addYears(monthlySubscription.startedAt, 1), 9),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 6),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      endedAt: setMonth(addYears(monthlySubscription.startedAt, 1), 6),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 9),
      ),
    ).toEqual(subscription.price);
  });

  it("each = 2 && startedAtMonth % month = 0 && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...twoMonthlySubscription,
      startedAt: setMonth(subYears(twoMonthlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 4),
      ),
    ).toEqual(subscription.price);
  });

  it("each = 2 && startedAtMonth % month = 1 && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...twoMonthlySubscription,
      startedAt: setMonth(subYears(twoMonthlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 3),
      ),
    ).toEqual(0);
  });
});

describe("yearly", () => {
  it("startedAtMonth < month && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(subYears(yearlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 3),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(yearlySubscription.startedAt, 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 3),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth = month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(yearlySubscription.startedAt, 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth = month && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(subYears(yearlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(subscription.price);
  });

  it("month < startedAtMonth && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(yearlySubscription.startedAt, 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(0);
  });

  it("month < startedAtMonth && year < startedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(addYears(yearlySubscription.startedAt, 1), 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < endedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(subYears(yearlySubscription.startedAt, 2), 2),
      endedAt: setMonth(subYears(yearlySubscription.startedAt, 1), 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 6),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(subYears(yearlySubscription.startedAt, 2), 2),
      endedAt: setMonth(yearlySubscription.startedAt, 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 6),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month = endedAtMonth && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(subYears(yearlySubscription.startedAt, 2), 2),
      endedAt: setMonth(yearlySubscription.startedAt, 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 4),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month = endedAtMonth && startedAtYear = year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(yearlySubscription.startedAt, 2),
      endedAt: setMonth(addYears(yearlySubscription.startedAt, 1), 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 4),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth = month < endedAtMonth && startedAtYear < year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(subYears(yearlySubscription.startedAt, 1), 2),
      endedAt: setMonth(addYears(yearlySubscription.startedAt, 1), 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth = month < endedAtMonth && year < startedAtYear < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(addYears(yearlySubscription.startedAt, 1), 2),
      endedAt: setMonth(addYears(yearlySubscription.startedAt, 2), 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(0);
  });

  it("month < startedAtMonth < endedAtMonth && year < startedAtYear < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: setMonth(addYears(yearlySubscription.startedAt, 1), 2),
      endedAt: setMonth(addYears(yearlySubscription.startedAt, 2), 4),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 1),
      ),
    ).toEqual(0);
  });

  it("each = 2 && startedAtMonth = month && startedAtYear % year = 1", () => {
    const subscription: SubscriptionModel = {
      ...twoYearlySubscription,
      startedAt: setMonth(subYears(twoYearlySubscription.startedAt, 1), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(0);
  });

  it("each = 2 && startedAtMonth = month && startedAtYear % year = 0", () => {
    const subscription: SubscriptionModel = {
      ...twoYearlySubscription,
      startedAt: setMonth(subYears(twoYearlySubscription.startedAt, 2), 2),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        setMonth(startOfYear, 2),
      ),
    ).toEqual(subscription.price);
  });
});
