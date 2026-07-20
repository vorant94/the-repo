import {
  addMonths,
  addYears,
  differenceInMonths,
  differenceInYears,
  isBefore,
  setMonth,
  setYear,
} from "date-fns";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { isSubscriptionExpired } from "./is-subscription-expired.ts";

export function getSubscriptionNextPaymentAt(
  subscription: SubscriptionModel,
  now: Date = new Date(),
): Date | null {
  const manipulateUnit = subscription.cycle.period;

  if (isSubscriptionExpired(subscription, now)) {
    return null;
  }

  const nextPaymentDate =
    manipulateUnit === "monthly" ? addMonths(now, 1) : addYears(now, 1);
  if (isSubscriptionExpired(subscription, nextPaymentDate)) {
    return null;
  }

  if (subscription.startedAt > now) {
    return subscription.startedAt;
  }

  const dateInCurrentPeriod = setMonth(
    setYear(subscription.startedAt, now.getFullYear()),
    now.getMonth(),
  );
  const differenceInPeriods =
    manipulateUnit === "monthly"
      ? differenceInMonths(dateInCurrentPeriod, subscription.startedAt)
      : differenceInYears(dateInCurrentPeriod, subscription.startedAt);
  const nextPaymentAt =
    manipulateUnit === "monthly"
      ? addMonths(subscription.startedAt, Math.floor(differenceInPeriods))
      : addYears(subscription.startedAt, Math.floor(differenceInPeriods));

  if (isBefore(nextPaymentAt, now)) {
    return manipulateUnit === "monthly"
      ? addMonths(nextPaymentAt, 1)
      : addYears(nextPaymentAt, 1);
  }

  return nextPaymentAt;
}

export interface SubscriptionWithNextPaymentAt extends SubscriptionModel {
  nextPaymentAt: Date;
}
