import {
  addMonths,
  addYears,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { describe, expect, it } from "vitest";
import {
  monthlySubscription,
  yearlySubscription,
} from "../../../shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { isSubscriptionExpired } from "./is-subscription-expired.ts";

describe("monthly", () => {
  it("no endedAt", () => {
    const subscription = {
      ...monthlySubscription,
    } satisfies SubscriptionModel;
    const compareTo = addMonths(subscription.startedAt, 1);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });

  it("endedAt < compareTo", () => {
    const subscription = {
      ...monthlySubscription,
      endedAt: addMonths(monthlySubscription.startedAt, 1),
    } satisfies SubscriptionModel;
    const compareTo = addMonths(subscription.endedAt, 1);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("endedAt = compareTo", () => {
    const subscription = {
      ...monthlySubscription,
      endedAt: addMonths(monthlySubscription.startedAt, 1),
    } satisfies SubscriptionModel;
    const compareTo = startOfMonth(subscription.endedAt);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("compareTo < endedAt", () => {
    const subscription = {
      ...monthlySubscription,
      endedAt: addMonths(monthlySubscription.startedAt, 1),
    } satisfies SubscriptionModel;
    const compareTo = subMonths(subscription.endedAt, 1);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });
});

describe("yearly", () => {
  it("no endedAt", () => {
    const subscription = {
      ...yearlySubscription,
    } satisfies SubscriptionModel;
    const compareTo = addYears(subscription.startedAt, 1);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });

  it("endedAt < compareTo", () => {
    const subscription = {
      ...yearlySubscription,
      endedAt: addYears(yearlySubscription.startedAt, 1),
    } satisfies SubscriptionModel;
    const compareTo = addYears(subscription.endedAt, 1);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("endedAt = compareTo", () => {
    const subscription = {
      ...yearlySubscription,
      endedAt: addYears(yearlySubscription.startedAt, 1),
    } satisfies SubscriptionModel;
    const compareTo = startOfYear(subscription.endedAt);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("compareTo < endedAt", () => {
    const subscription = {
      ...yearlySubscription,
      endedAt: addYears(yearlySubscription.startedAt, 1),
    } satisfies SubscriptionModel;
    const compareTo = subYears(subscription.endedAt, 1);

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });
});
