import type { ComboboxData } from "@mantine/core";

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
