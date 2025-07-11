import dayjs from "dayjs";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { subscriptionCyclePeriodToManipulateUnit } from "../../../shared/api/subscription-cycle-period.model.ts";
import { isSubscriptionExpired } from "./is-subscription-expired.ts";

export function calculateSubscriptionPriceForMonth(
  subscription: SubscriptionModel,
  now: Date = new Date(),
): number {
  const startedAtDayJs = dayjs(subscription.startedAt);
  const manipulateUnit =
    subscriptionCyclePeriodToManipulateUnit[subscription.cycle.period];

  if (startedAtDayJs.isAfter(now, manipulateUnit)) {
    return 0;
  }

  if (isSubscriptionExpired(subscription, now)) {
    return 0;
  }

  const differenceInPeriods = startedAtDayJs
    .set("year", now.getFullYear())
    .set("month", now.getMonth())
    .diff(subscription.startedAt, manipulateUnit);
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
