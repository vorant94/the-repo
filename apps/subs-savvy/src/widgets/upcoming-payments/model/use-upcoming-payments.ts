import { compareAsc } from "date-fns";
import {
  getSubscriptionNextPaymentAt,
  type SubscriptionWithNextPaymentAt,
} from "../../../entities/subscription/lib/get-subscription-next-payment-at.ts";
import { useSubscriptions } from "../../../shared/store/hooks.ts";
import { useBreakpoint } from "../../../shared/ui/use-breakpoint.tsx";

export function useUpcomingPayments(): Array<SubscriptionWithNextPaymentAt> {
  const subscriptions = useSubscriptions();

  const isLg = useBreakpoint("lg");
  const isXl = useBreakpoint("xl");

  const filteredAndSorted = subscriptions
    .map((subscription) => ({
      ...subscription,
      nextPaymentAt: getSubscriptionNextPaymentAt(subscription),
    }))
    .filter(
      (subscription): subscription is SubscriptionWithNextPaymentAt =>
        !!subscription.nextPaymentAt,
    )
    .toSorted((a, b) => compareAsc(a.nextPaymentAt, b.nextPaymentAt));

  return filteredAndSorted.slice(0, isXl ? 4 : isLg ? 3 : 2);
}
