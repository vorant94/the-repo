import { isBefore, isSameMonth, isSameYear } from "date-fns";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";

export function isSubscriptionExpired(
  subscription: SubscriptionModel,
  now = new Date(),
): boolean {
  if (!subscription.endedAt) {
    return false;
  }

  const isSamePeriod =
    subscription.cycle.period === "monthly" ? isSameMonth : isSameYear;
  if (isSamePeriod(subscription.startedAt, now)) {
    return false;
  }

  return (
    isBefore(subscription.endedAt, now) ||
    isSamePeriod(subscription.endedAt, now)
  );
}
