import {
  type SubscriptionsAggregatedByCategory,
  noCategoryPlaceholder,
} from "@/entities/subscription/lib/aggregate-subscriptions-by-category.ts";
import { usePercentageFormatter } from "@/features/i18n/model/use-percentage-formatter.ts";
import { cn } from "@/shared/ui/cn.ts";
import { Icon } from "@/shared/ui/icon.tsx";
import { Text } from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export const ExpensesPerMonthLegendContent = memo(
  ({
    aggregatedSubscriptions,
    totalExpenses,
  }: ExpensesPerMonthLegendContentPros) => {
    const { t } = useTranslation();

    const percentageFormatter = usePercentageFormatter();

    return (
      <ul className={cn("mt-2 flex items-center gap-6 overflow-auto")}>
        {aggregatedSubscriptions.map((c) => (
          <li
            key={c.category.id}
            className={cn("flex items-center")}
          >
            <Icon
              icon={IconCircleFilled}
              color={c.category.color}
              className={cn("mr-2")}
              size="0.5em"
            />
            <Text
              size="xs"
              className={cn("whitespace-nowrap")}
            >
              {c.category.id === -1
                ? t(noCategoryPlaceholder.name)
                : c.category.name}
            </Text>
            &nbsp;
            <Text
              c="dimmed"
              size="xs"
            >
              •
            </Text>
            &nbsp;
            <Text
              size="xs"
              c="dimmed"
            >
              {percentageFormatter.format(c.totalExpenses / totalExpenses)}
            </Text>
          </li>
        ))}
      </ul>
    );
  },
);

export interface ExpensesPerMonthLegendContentPros {
  aggregatedSubscriptions: Array<SubscriptionsAggregatedByCategory>;
  totalExpenses: number;
}
