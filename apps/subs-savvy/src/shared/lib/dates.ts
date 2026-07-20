import {
  startOfMonth as getStartOfMonth,
  startOfYear as getStartOfYear,
  startOfDay,
} from "date-fns";

export const startOfToday = startOfDay(new Date());

export const startOfMonth = getStartOfMonth(new Date());

export const startOfYear = getStartOfYear(new Date());
