import {
  addMonths,
  addYears,
  setDate,
  setMonth,
  subDays,
  subYears,
} from "date-fns";
import { expect, it } from "vitest";
import {
  monthlySubscription,
  yearlySubscription,
} from "../../../shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { getSubscriptionNextPaymentAt } from "./get-subscription-next-payment-at.ts";

it("monthly subscription", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: subYears(setDate(monthlySubscription.startedAt, 1), 1),
  } satisfies SubscriptionModel;

  const expected = setDate(addMonths(new Date(), 1), 1);
  expect(getSubscriptionNextPaymentAt(subscription)).toBeSame(expected, "day");
});

it("yearly subscription", () => {
  const subscription = {
    ...yearlySubscription,
    startedAt: subYears(
      setMonth(setDate(monthlySubscription.startedAt, 1), 1),
      1,
    ),
  } satisfies SubscriptionModel;
  const now = addMonths(subscription.startedAt, 6);

  const expected = addYears(subscription.startedAt, 1);
  expect(getSubscriptionNextPaymentAt(subscription, now)).toBeSame(
    expected,
    "day",
  );
});

it("expired subscription", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: subYears(setDate(monthlySubscription.startedAt, 1), 1),
    endedAt: addMonths(
      subYears(setDate(monthlySubscription.startedAt, 1), 1),
      1,
    ),
  } satisfies SubscriptionModel;

  expect(getSubscriptionNextPaymentAt(subscription)).toBeNull();
});

it("will expire before supposed next payment date", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: subYears(setDate(monthlySubscription.startedAt, 1), 1),
    endedAt: addMonths(
      subYears(setDate(monthlySubscription.startedAt, 1), 1),
      2,
    ),
  } satisfies SubscriptionModel;
  const now = subDays(subscription.endedAt, 2);

  expect(getSubscriptionNextPaymentAt(subscription, now)).toBeNull();
});

it("startedAt is in the future", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: addYears(monthlySubscription.startedAt, 3),
  } satisfies SubscriptionModel;

  const expected = subscription.startedAt;
  expect(getSubscriptionNextPaymentAt(subscription)).toBeSame(expected, "day");
});

it("startedAt is in past, but its day is bigger that current", () => {
  const subscription = {
    ...monthlySubscription,
    startedAt: subYears(monthlySubscription.startedAt, 3),
  } satisfies SubscriptionModel;
  const now = subDays(monthlySubscription.startedAt, 2);

  const expected = monthlySubscription.startedAt;
  expect(getSubscriptionNextPaymentAt(subscription, now)).toBeSame(
    expected,
    "day",
  );
});
