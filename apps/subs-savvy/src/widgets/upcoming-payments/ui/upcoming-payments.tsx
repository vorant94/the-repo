import { Text } from "@mantine/core";
import { cn } from "cn";
import type { FC, HTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import {
  SubscriptionGrid,
  type SubscriptionGridChildrenProps,
} from "../../../features/list-subscriptions/ui/subscription-grid.tsx";
import { SubscriptionGridItem } from "../../../features/list-subscriptions/ui/subscription-grid-item.tsx";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { useStore } from "../../../shared/store/hooks.ts";
import { useUpcomingPayments } from "../model/use-upcoming-payments.ts";

export const UpcomingPayments: FC<UpcomingPaymentsProps> = ({ className }) => {
  const { t } = useTranslation();

  const upcomingPayments = useUpcomingPayments();

  const openSubscriptionUpdate = (subscription: SubscriptionModel) =>
    useStore.getState().openUpsertSubscription(subscription);

  const subscriptionGridChildren = ({
    subscription,
  }: SubscriptionGridChildrenProps) => (
    <SubscriptionGridItem
      key={subscription.id}
      subscription={subscription}
      onClick={openSubscriptionUpdate}
      hideDescription={true}
    />
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
};

export interface UpcomingPaymentsProps
  extends Pick<HTMLAttributes<HTMLDivElement>, "className"> {}
