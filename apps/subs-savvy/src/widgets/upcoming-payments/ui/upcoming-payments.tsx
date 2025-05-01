import { Text } from "@mantine/core";
import { cn } from "cn";
import { type FC, type HTMLAttributes, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionGridItem } from "../../../features/list-subscriptions/ui/subscription-grid-item.tsx";
import {
  SubscriptionGrid,
  type SubscriptionGridChildrenProps,
} from "../../../features/list-subscriptions/ui/subscription-grid.tsx";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { useStore } from "../../../shared/store/hooks.ts";
import { useUpcomingPayments } from "../model/use-upcoming-payments.ts";

export const UpcomingPayments: FC<UpcomingPaymentsProps> = memo(
  ({ className }) => {
    const { t } = useTranslation();

    const upcomingPayments = useUpcomingPayments();

    const openSubscriptionUpdate = useCallback(
      (subscription: SubscriptionModel) =>
        useStore.getState().openUpsertSubscription(subscription),
      [],
    );

    const subscriptionGridChildren = useCallback(
      ({ subscription }: SubscriptionGridChildrenProps) => (
        <SubscriptionGridItem
          key={subscription.id}
          subscription={subscription}
          onClick={openSubscriptionUpdate}
          hideDescription={true}
        />
      ),
      [openSubscriptionUpdate],
    );

    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <Text
          className={cn("font-medium")}
          size="sm"
          c="dimmed"
        >
          {t("upcoming-payments")}
        </Text>

        <SubscriptionGrid
          subscriptions={upcomingPayments}
          noSubscriptionsPlaceholder={"No Upcoming Subscriptions"}
        >
          {subscriptionGridChildren}
        </SubscriptionGrid>
      </div>
    );
  },
);

export interface UpcomingPaymentsProps
  extends Pick<HTMLAttributes<HTMLDivElement>, "className"> {}
