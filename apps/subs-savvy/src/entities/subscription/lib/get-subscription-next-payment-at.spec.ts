import {
  monthlySubscription,
  yearlySubscription,
} from "@/shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "@/shared/api/subscription.model.ts";
import dayjs from "dayjs";
import { expect, it } from "vitest";
import { getSubscriptionNextPaymentAt } from "./get-subscription-next-payment-at.ts";

it("monthly subscription", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: dayjs(monthlySubscription.startedAt)
      .set("date", 1)
      .subtract(1, "year")
      .toDate(),
  } satisfies SubscriptionModel;

  const expected = dayjs(new Date()).add(1, "month").set("date", 1).toDate();
  expect(getSubscriptionNextPaymentAt(subscription)).toBeSame(expected, "day");
});

it("yearly subscription", () => {
  const subscription = {
    ...yearlySubscription,
    startedAt: dayjs(monthlySubscription.startedAt)
      .set("date", 1)
      .set("month", 1)
      .subtract(1, "year")
      .toDate(),
  } satisfies SubscriptionModel;
  const now = dayjs(subscription.startedAt).add(6, "month").toDate();

  const expected = dayjs(subscription.startedAt).add(1, "year").toDate();
  expect(getSubscriptionNextPaymentAt(subscription, now)).toBeSame(
    expected,
    "day",
  );
});

it("expired subscription", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: dayjs(monthlySubscription.startedAt)
      .set("date", 1)
      .subtract(1, "year")
      .toDate(),
    endedAt: dayjs(monthlySubscription.startedAt)
      .set("date", 1)
      .subtract(1, "year")
      .add(1, "month")
      .toDate(),
  } satisfies SubscriptionModel;

  expect(getSubscriptionNextPaymentAt(subscription)).toBeNull();
});

it("will expire before supposed next payment date", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: dayjs(monthlySubscription.startedAt)
      .set("date", 1)
      .subtract(1, "year")
      .toDate(),
    endedAt: dayjs(monthlySubscription.startedAt)
      .set("date", 1)
      .subtract(1, "year")
      .add(2, "month")
      .toDate(),
  } satisfies SubscriptionModel;
  const now = dayjs(subscription.endedAt).subtract(2, "days").toDate();

  expect(getSubscriptionNextPaymentAt(subscription, now)).toBeNull();
});

it("startedAt is in the future", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: dayjs(monthlySubscription.startedAt).add(3, "year").toDate(),
  } satisfies SubscriptionModel;

  const expected = dayjs(subscription.startedAt).toDate();
  expect(getSubscriptionNextPaymentAt(subscription)).toBeSame(expected, "day");
});

it("startedAt is in past, but its day is bigger that current", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: dayjs(monthlySubscription.startedAt)
      .subtract(3, "year")
      .toDate(),
  } satisfies SubscriptionModel;
  const now = dayjs(monthlySubscription.startedAt).subtract(2, "days").toDate();

  const expected = dayjs(monthlySubscription.startedAt).toDate();
  expect(getSubscriptionNextPaymentAt(subscription, now)).toBeSame(
    expected,
    "day",
  );
});
