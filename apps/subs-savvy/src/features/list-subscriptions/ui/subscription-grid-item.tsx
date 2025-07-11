import { Avatar, Card, Indicator, Text, Title } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { cn } from "cn";
import { memo, useCallback, useMemo } from "react";
import {
  getSubscriptionNextPaymentAt,
  type SubscriptionWithNextPaymentAt,
} from "../../../entities/subscription/lib/get-subscription-next-payment-at.ts";
import { isSubscriptionExpired } from "../../../entities/subscription/lib/is-subscription-expired.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { subscriptionIconToSvg } from "../../../shared/api/subscription-icon-to-svg.tsx";
import { Icon } from "../../../shared/ui/icon.tsx";
import { useCurrencyFormatter } from "../../i18n/model/use-currency-formatter.ts";
import { NextPaymentAt } from "./next-payment-at.tsx";

export const SubscriptionGridItem = memo(
  ({
    subscription,
    onClick,
    hideDescription,
    hideNextPaymentAt,
  }: SubscriptionGridItemProps) => {
    const isExpired = useMemo(
      () => isSubscriptionExpired(subscription),
      [subscription],
    );

    const fireClickEvent = useCallback(
      () => onClick(subscription),
      [subscription, onClick],
    );

    const nextPaymentAt = useMemo(
      () =>
        "nextPaymentAt" in subscription
          ? subscription.nextPaymentAt
          : getSubscriptionNextPaymentAt(subscription),
      [subscription],
    );

    const currencyFormatter = useCurrencyFormatter();

    const Component = (
      <Card
        aria-label={subscription.name}
        component="button"
        className={cn("block min-h-16 text-left")}
        onClick={fireClickEvent}
      >
        <div className={cn("flex items-center gap-2")}>
          <Avatar
            radius={0}
            variant="transparent"
          >
            {subscriptionIconToSvg[subscription.icon]}
          </Avatar>

          <div className={cn("flex flex-1 flex-col overflow-hidden")}>
            <div className={cn("flex items-center gap-1")}>
              <Title
                order={5}
                className={cn("!mb-0 truncate uppercase")}
              >
                {subscription.name}
              </Title>

              {subscription.category && (
                <Icon
                  className={cn("flex-shrink-0")}
                  icon={IconCircleFilled}
                  color={subscription.category.color}
                />
              )}

              <div className={cn("flex-1")} />

              <Title
                order={4}
                className={cn("!mb-0")}
              >
                {currencyFormatter.format(subscription.price)}
              </Title>
            </div>

            {subscription.description && !hideDescription ? (
              <Text
                size="sm"
                className={cn("block truncate")}
                c="dimmed"
              >
                {subscription.description}
              </Text>
            ) : null}

            {nextPaymentAt && !hideNextPaymentAt ? (
              <NextPaymentAt nextPaymentAt={nextPaymentAt} />
            ) : null}
          </div>
        </div>
      </Card>
    );

    return isExpired ? (
      <Indicator
        className={cn("flex flex-col opacity-60")}
        color="gray"
        size="xs"
        position="bottom-center"
        label="Expired"
      >
        {Component}
      </Indicator>
    ) : (
      Component
    );
  },
);

export interface SubscriptionGridItemProps {
  subscription: SubscriptionModel | SubscriptionWithNextPaymentAt;
  onClick: (
    subscription: SubscriptionModel | SubscriptionWithNextPaymentAt,
  ) => void;
  hideDescription?: boolean;
  hideNextPaymentAt?: boolean;
}
