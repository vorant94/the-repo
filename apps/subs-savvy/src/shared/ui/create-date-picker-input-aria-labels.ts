import type { CalendarAriaLabels } from "@mantine/dates";

export function createDatePickerInputAriaLabels(
  label: string,
): DatePickerInputAriaLabels {
  return {
    previousMonth: `${label} previous month`,
    nextMonth: `${label} next month`,
    monthLevelControl: `${label} month`,
  };
}

export type DatePickerInputAriaLabels = Required<
  Pick<CalendarAriaLabels, "previousMonth" | "nextMonth" | "monthLevelControl">
>;
