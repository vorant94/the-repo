import {
  type SubscriptionWithNextPaymentAt,
  getSubscriptionNextPaymentAt,
} from "@/entities/subscription/lib/get-subscription-next-payment-at.ts";
import { useSubscriptions } from "@/entities/subscription/model/subscriptions.store.tsx";
import { useBreakpoint } from "@/shared/ui/use-breakpoint.tsx";
import dayjs from "dayjs";
import { useMemo } from "react";

// TODO do so if subA has two payment dates before subB, so the upcoming payments
// 	will look like "subA, subA, subB"
export function useUpcomingPayments(): Array<SubscriptionWithNextPaymentAt> {
  const subscriptions = useSubscriptions();

  const isLg = useBreakpoint("lg");
  const isXl = useBreakpoint("xl");

  const filteredAndSorted = useMemo(
    () =>
      subscriptions
        .map((subscription) => ({
          ...subscription,
          nextPaymentAt: getSubscriptionNextPaymentAt(subscription),
        }))
        .filter(
          (subscription): subscription is SubscriptionWithNextPaymentAt =>
            !!subscription.nextPaymentAt,
        )
        .toSorted((a, b) =>
          dayjs(a.nextPaymentAt).isBefore(b.nextPaymentAt) ? -1 : 1,
        ),
    [subscriptions],
  );

  return useMemo(
    () => filteredAndSorted.slice(0, isXl ? 4 : isLg ? 3 : 2),
    [filteredAndSorted, isXl, isLg],
  );
}
