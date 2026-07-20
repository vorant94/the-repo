import { differenceInYears, isSameYear, setYear } from "date-fns";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { isSubscriptionExpired } from "./is-subscription-expired.ts";

export function calculateSubscriptionPriceForYear(
  subscription: SubscriptionModel,
  now: Date = new Date(),
): number {
  if (subscription.startedAt.getFullYear() > now.getFullYear()) {
    return 0;
  }

  switch (subscription.cycle.period) {
    case "yearly": {
      if (isSubscriptionExpired(subscription, now)) {
        return 0;
      }

      const dateInCurrentYear = setYear(
        subscription.startedAt,
        now.getFullYear(),
      );
      const yearsSinceStart = differenceInYears(
        dateInCurrentYear,
        subscription.startedAt,
      );
      if (yearsSinceStart % subscription.cycle.each !== 0) {
        return 0;
      }

      return subscription.price;
    }
    case "monthly": {
      if (subscription.endedAt) {
        if (
          isSameYear(subscription.endedAt, now) &&
          isSameYear(subscription.startedAt, now)
        ) {
          return (
            (subscription.price *
              (subscription.endedAt.getMonth() -
                subscription.startedAt.getMonth())) /
            subscription.cycle.each
          );
        }

        if (isSameYear(subscription.endedAt, now)) {
          return (
            (subscription.price * subscription.endedAt.getMonth()) /
            subscription.cycle.each
          );
        }
      }

      if (isSameYear(subscription.startedAt, now)) {
        return (
          (subscription.price * (12 - subscription.startedAt.getMonth())) /
          subscription.cycle.each
        );
      }

      if (isSubscriptionExpired(subscription, now)) {
        return 0;
      }

      return (subscription.price * 12) / subscription.cycle.each;
    }
  }
}
