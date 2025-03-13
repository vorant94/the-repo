import type { ComboboxData } from "@mantine/core";
import type { ManipulateType } from "dayjs";

export const subscriptionCyclePeriods = ["monthly", "yearly"] as const;
export type SubscriptionCyclePeriodModel =
  (typeof subscriptionCyclePeriods)[number];

export const subscriptionCyclePeriodToLabel = {
  monthly: "Month",
  yearly: "Year",
} as const satisfies Record<SubscriptionCyclePeriodModel, string>;

export const subscriptionCyclePeriodsComboboxData: ComboboxData =
  subscriptionCyclePeriods.map((cyclePeriod) => ({
    value: cyclePeriod,
    label: subscriptionCyclePeriodToLabel[cyclePeriod],
  }));

export const subscriptionCyclePeriodToManipulateUnit = {
  monthly: "month",
  yearly: "year",
} satisfies Record<SubscriptionCyclePeriodModel, ManipulateType>;
