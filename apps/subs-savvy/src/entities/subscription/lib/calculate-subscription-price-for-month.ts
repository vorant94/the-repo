import {
  differenceInMonths,
  differenceInYears,
  isAfter,
  setMonth,
  setYear,
  startOfMonth,
} from "date-fns";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { isSubscriptionExpired } from "./is-subscription-expired.ts";

export function calculateSubscriptionPriceForMonth(
  subscription: SubscriptionModel,
  now: Date = new Date(),
): number {
  if (isAfter(startOfMonth(subscription.startedAt), startOfMonth(now))) {
    return 0;
  }

  if (isSubscriptionExpired(subscription, now)) {
    return 0;
  }

  const dateInCurrentPeriod = setMonth(
    setYear(subscription.startedAt, now.getFullYear()),
    now.getMonth(),
  );
  const differenceInPeriods =
    subscription.cycle.period === "monthly"
      ? differenceInMonths(dateInCurrentPeriod, subscription.startedAt)
      : differenceInYears(dateInCurrentPeriod, subscription.startedAt);
  if (differenceInPeriods % subscription.cycle.each !== 0) {
    return 0;
  }

  switch (subscription.cycle.period) {
    case "monthly": {
      return subscription.price;
    }
    case "yearly": {
      return now.getMonth() === subscription.startedAt.getMonth()
        ? subscription.price
        : 0;
    }
    default: {
      throw new Error(
        `Unsupported subscriptions cycle period ${subscription.cycle.period}`,
      );
    }
  }
}
