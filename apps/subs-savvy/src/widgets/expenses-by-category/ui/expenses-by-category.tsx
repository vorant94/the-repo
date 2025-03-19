import {
  type SubscriptionsAggregatedByCategory,
  aggregateSubscriptionsByCategory,
  noCategoryPlaceholder,
} from "@/entities/subscription/lib/aggregate-subscriptions-by-category.ts";
import { calculateSubscriptionPriceForMonth } from "@/entities/subscription/lib/calculate-subscription-price-for-month.ts";
import { calculateSubscriptionPriceForYear } from "@/entities/subscription/lib/calculate-subscription-price-for-year.ts";
import { useSubscriptions } from "@/entities/subscription/model/subscriptions.store.tsx";
import { useCurrencyFormatter } from "@/features/i18n/model/use-currency-formatter.ts";
import { startOfMonth } from "@/shared/lib/dates.ts";
import { Icon } from "@/shared/ui/icon.tsx";
import { useBreakpoint } from "@/shared/ui/use-breakpoint.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  Divider,
  SegmentedControl,
  type SegmentedControlItem,
  Text,
} from "@mantine/core";
import { IconCircleFilled } from "@tabler/icons-react";
import { cn } from "cn";
import dayjs from "dayjs";
import {
  type FC,
  type HTMLAttributes,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Cell, Label, Pie, PieChart } from "recharts";
import { z } from "zod";
import { ExpensesByCategoryLabelContent } from "./expenses-by-category-label-content.tsx";

export const ExpensesByCategory: FC<ExpensesByCategoryProps> = memo(
  ({ className }) => {
    const { t } = useTranslation();

    const periodOptions: Array<SegmentedControlItem> = useMemo(
      () => [
        { value: periodValue["6months"], label: t("n-months", { n: 6 }) },
        { value: periodValue.year, label: t("year") },
      ],
      [t],
    );

    const { control, watch } = useForm<FormValue>({
      resolver: zodResolver(formValueSchema),
      defaultValues,
    });

    const period = watch("period");

    const subscriptions = useSubscriptions();

    const aggregatedSubscriptionsForYear = useMemo(() => {
      return aggregateSubscriptionsByCategory(subscriptions, (subscription) =>
        calculateSubscriptionPriceForYear(subscription),
      );
    }, [subscriptions]);
    const aggregatedSubscriptionsFor6Months = useMemo(() => {
      return aggregateSubscriptionsByCategory(subscriptions, (subscription) =>
        // ugly, I know... but currently I don't want to go into generic calculation function like
        // calculateSubscriptionPriceForPeriod, so calculateSubscriptionPriceForMonth * 6 is the way to go.
        // anyway calculation isn't tied to period change, but is done regardless,
        // hence this calculation is usually done once per dashboard is loaded
        [0, 1, 2, 3, 4, 5]
          .map((step) =>
            calculateSubscriptionPriceForMonth(
              subscription,
              dayjs(startOfMonth).subtract(step, "month").toDate(),
            ),
          )
          .reduce((prev, curr) => prev + curr),
      );
    }, [subscriptions]);

    const subsToShow = useMemo(() => {
      const periodToAggregatedSubs = {
        year: aggregatedSubscriptionsForYear,
        "6months": aggregatedSubscriptionsFor6Months,
      } as const satisfies Record<
        PeriodValue,
        Array<SubscriptionsAggregatedByCategory>
      >;

      return periodToAggregatedSubs[period];
    }, [
      period,
      aggregatedSubscriptionsForYear,
      aggregatedSubscriptionsFor6Months,
    ]);

    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const updateActiveIndex = useCallback((_: unknown, index: number) => {
      setActiveIndex(index);
    }, []);
    const resetActiveIndex = useCallback(() => {
      setActiveIndex(-1);
    }, []);

    const currencyFormatter = useCurrencyFormatter();

    const isMd = useBreakpoint("md");

    return (
      <div className={cn("flex flex-col gap-4 md:items-start", className)}>
        <Text
          className={cn("font-medium")}
          size="sm"
          c="dimmed"
        >
          {t("expenses-by-category")}
        </Text>

        <Card className={cn("flex flex-col items-start gap-4 md:gap-8")}>
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <SegmentedControl
                {...field}
                data={periodOptions}
              />
            )}
          />

          <div
            className={cn(
              "flex flex-col items-center gap-4 self-stretch md:flex-row md:gap-8",
            )}
          >
            <PieChart
              width={180}
              height={180}
            >
              <Pie
                innerRadius={70}
                outerRadius={90}
                data={subsToShow}
                dataKey="totalExpenses"
                onMouseEnter={updateActiveIndex}
                onMouseLeave={resetActiveIndex}
                activeIndex={activeIndex}
              >
                {subsToShow.map((subByCategory) => (
                  <Cell
                    key={subByCategory.category.id}
                    fill={subByCategory.category.color}
                  />
                ))}
                <Label
                  content={(props) => (
                    <ExpensesByCategoryLabelContent
                      aggregatedSubscriptions={subsToShow}
                      activeIndex={activeIndex}
                      {...props}
                    />
                  )}
                />
              </Pie>
            </PieChart>

            <Divider
              className={cn("self-stretch")}
              orientation={isMd ? "vertical" : "horizontal"}
            />

            <ul
              className={cn("flex max-h-full flex-col gap-4 overflow-y-auto")}
            >
              {subsToShow.map(({ category, totalExpenses }) => (
                <li
                  className={cn("flex items-center gap-2")}
                  key={category.id}
                >
                  <Icon
                    icon={IconCircleFilled}
                    color={category.color}
                    size="0.5em"
                  />
                  <Text
                    size="xs"
                    className={cn("flex-1")}
                  >
                    {category.id === -1
                      ? t(noCategoryPlaceholder.name)
                      : category.name}
                  </Text>
                  <Text size="xs">
                    {currencyFormatter.format(totalExpenses)}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    );
  },
);

export interface ExpensesByCategoryProps
  extends Pick<HTMLAttributes<HTMLDivElement>, "className"> {}

const periodValues = ["6months", "year"] as const;
type PeriodValue = (typeof periodValues)[number];

const periodValue = {
  "6months": "6months",
  year: "year",
} as const satisfies Record<PeriodValue, PeriodValue>;

const formValueSchema = z.object({
  period: z.enum(periodValues),
});
type FormValue = z.infer<typeof formValueSchema>;

const defaultValues: FormValue = {
  period: "year",
};
