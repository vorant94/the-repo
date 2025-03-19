import dayjs from "dayjs";
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
    const compareTo = dayjs(subscription.startedAt).add(1, "month").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });

  it("endedAt < compareTo", () => {
    const subscription = {
      ...monthlySubscription,
      endedAt: dayjs(monthlySubscription.startedAt).add(1, "month").toDate(),
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.endedAt).add(1, "month").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("endedAt = compareTo", () => {
    const subscription = {
      ...monthlySubscription,
      endedAt: dayjs(monthlySubscription.startedAt).add(1, "month").toDate(),
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.endedAt).startOf("month").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("compareTo < endedAt", () => {
    const subscription = {
      ...monthlySubscription,
      endedAt: dayjs(monthlySubscription.startedAt).add(1, "month").toDate(),
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.endedAt).subtract(1, "month").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });
});

describe("yearly", () => {
  it("no endedAt", () => {
    const subscription = {
      ...yearlySubscription,
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.startedAt).add(1, "year").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });

  it("endedAt < compareTo", () => {
    const subscription = {
      ...yearlySubscription,
      endedAt: dayjs(yearlySubscription.startedAt).add(1, "year").toDate(),
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.endedAt).add(1, "year").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("endedAt = compareTo", () => {
    const subscription = {
      ...yearlySubscription,
      endedAt: dayjs(yearlySubscription.startedAt).add(1, "year").toDate(),
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.endedAt).startOf("year").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeTruthy();
  });

  it("compareTo < endedAt", () => {
    const subscription = {
      ...yearlySubscription,
      endedAt: dayjs(yearlySubscription.startedAt).add(1, "year").toDate(),
    } satisfies SubscriptionModel;
    const compareTo = dayjs(subscription.endedAt).subtract(1, "year").toDate();

    expect(isSubscriptionExpired(subscription, compareTo)).toBeFalsy();
  });
});
