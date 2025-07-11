import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LabelProps } from "recharts";
import type { PolarViewBox } from "recharts/types/util/types";
import {
  noCategoryPlaceholder,
  type SubscriptionsAggregatedByCategory,
} from "../../../entities/subscription/lib/aggregate-subscriptions-by-category.ts";
import { useCurrencyFormatter } from "../../../features/i18n/model/use-currency-formatter.ts";

export const ExpensesByCategoryLabelContent = ({
  viewBox,
  aggregatedSubscriptions,
  activeIndex,
}: ExpensesByCategoryLabelContentPros) => {
  const { cx, cy } = viewBox as PolarViewBox;

  const totalExpenses = useMemo(
    () =>
      aggregatedSubscriptions.reduce(
        (prev, { totalExpenses }) => prev + totalExpenses,
        0,
      ),
    [aggregatedSubscriptions],
  );

  const { t } = useTranslation();

  const currencyFormatter = useCurrencyFormatter();

  return (
    <>
      <text
        x={cx}
        y={(cy ?? 0) - 10}
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan alignmentBaseline="middle">
          {aggregatedSubscriptions[activeIndex]?.category.id === -1
            ? t(noCategoryPlaceholder.name)
            : (aggregatedSubscriptions[activeIndex]?.category.name ??
              t("total"))}
        </tspan>
      </text>
      <text
        x={cx}
        y={(cy ?? 0) + 10}
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan>
          {currencyFormatter.format(
            aggregatedSubscriptions[activeIndex]?.totalExpenses ??
              totalExpenses,
          )}
        </tspan>
      </text>
    </>
  );
};

export interface ExpensesByCategoryLabelContentPros extends LabelProps {
  activeIndex: number;
  aggregatedSubscriptions: Array<SubscriptionsAggregatedByCategory>;
}
