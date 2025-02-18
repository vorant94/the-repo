import dayjs from "dayjs";
import { subscriptionCyclePeriodToManipulateUnit } from "../../../shared/api/subscription-cycle-period.model.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";

export function isSubscriptionExpired(
  subscription: SubscriptionModel,
  now = new Date(),
): boolean {
  if (!subscription.endedAt) {
    return false;
  }

  const manipulateUnit =
    subscriptionCyclePeriodToManipulateUnit[subscription.cycle.period];

  const startedAtDayJs = dayjs(subscription.startedAt);
  if (startedAtDayJs.isSame(now, manipulateUnit)) {
    return false;
  }

  const endedAtDayJs = dayjs(subscription.endedAt);
  return (
    endedAtDayJs.isBefore(now, manipulateUnit) ||
    endedAtDayJs.isSame(now, manipulateUnit)
  );
}
