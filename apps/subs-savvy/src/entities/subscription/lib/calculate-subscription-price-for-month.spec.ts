import {
  monthlySubscription,
  twoMonthlySubscription,
  twoYearlySubscription,
  yearlySubscription,
} from "@/shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "@/shared/api/subscription.model.ts";
import { startOfYear } from "@/shared/lib/dates.ts";
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { calculateSubscriptionPriceForMonth } from "./calculate-subscription-price-for-month.ts";

describe("monthly", () => {
  it("startedAtMonth < month && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 3).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth < month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt).set("month", 2).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 3).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth = month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt).set("month", 2).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("month < startedAtMonth && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt).set("month", 2).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 1).toDate(),
      ),
    ).toEqual(0);
  });

  it("month < startedAtMonth && year < startedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .add(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 1).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < endedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 6)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 9).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(monthlySubscription.startedAt).set("month", 6).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 9).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month = endedAtMonth && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(monthlySubscription.startedAt).set("month", 9).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 9).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month < endedAtMonth && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(monthlySubscription.startedAt).set("month", 9).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 6).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth < month < endedAtMonth && startedAtYear < year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(monthlySubscription.startedAt)
        .add(1, "year")
        .set("month", 9)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 6).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...monthlySubscription,
      startedAt: dayjs(monthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(monthlySubscription.startedAt)
        .add(1, "year")
        .set("month", 6)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 9).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("each = 2 && startedAtMonth % month = 0 && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...twoMonthlySubscription,
      startedAt: dayjs(twoMonthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 4).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("each = 2 && startedAtMonth % month = 1 && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...twoMonthlySubscription,
      startedAt: dayjs(twoMonthlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 3).toDate(),
      ),
    ).toEqual(0);
  });
});

describe("yearly", () => {
  it("startedAtMonth < month && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 3).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt).set("month", 2).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 3).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth = month && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt).set("month", 2).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth = month && startedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("month < startedAtMonth && startedAtYear = year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt).set("month", 4).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(0);
  });

  it("month < startedAtMonth && year < startedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .add(1, "year")
        .set("month", 4)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < endedAtYear < year", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .subtract(2, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(yearlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 4)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 6).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < endedAtMonth < month && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .subtract(2, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(yearlySubscription.startedAt).set("month", 4).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 6).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month = endedAtMonth && startedAtYear < year = endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .subtract(2, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(yearlySubscription.startedAt).set("month", 4).toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 4).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth < month = endedAtMonth && startedAtYear = year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt).set("month", 2).toDate(),
      endedAt: dayjs(yearlySubscription.startedAt)
        .add(1, "year")
        .set("month", 4)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 4).toDate(),
      ),
    ).toEqual(0);
  });

  it("startedAtMonth = month < endedAtMonth && startedAtYear < year < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(yearlySubscription.startedAt)
        .add(1, "year")
        .set("month", 4)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(subscription.price);
  });

  it("startedAtMonth = month < endedAtMonth && year < startedAtYear < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .add(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(yearlySubscription.startedAt)
        .add(2, "year")
        .set("month", 4)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(0);
  });

  it("month < startedAtMonth < endedAtMonth && year < startedAtYear < endedAtYear", () => {
    const subscription: SubscriptionModel = {
      ...yearlySubscription,
      startedAt: dayjs(yearlySubscription.startedAt)
        .add(1, "year")
        .set("month", 2)
        .toDate(),
      endedAt: dayjs(yearlySubscription.startedAt)
        .add(2, "year")
        .set("month", 4)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 1).toDate(),
      ),
    ).toEqual(0);
  });

  it("each = 2 && startedAtMonth = month && startedAtYear % year = 1", () => {
    const subscription: SubscriptionModel = {
      ...twoYearlySubscription,
      startedAt: dayjs(twoYearlySubscription.startedAt)
        .subtract(1, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(0);
  });

  it("each = 2 && startedAtMonth = month && startedAtYear % year = 0", () => {
    const subscription: SubscriptionModel = {
      ...twoYearlySubscription,
      startedAt: dayjs(twoYearlySubscription.startedAt)
        .subtract(2, "year")
        .set("month", 2)
        .toDate(),
    };

    expect(
      calculateSubscriptionPriceForMonth(
        subscription,
        dayjs(startOfYear).set("month", 2).toDate(),
      ),
    ).toEqual(subscription.price);
  });
});
