import { startOfToday } from "@/shared/lib/dates.ts";
import { Text } from "@mantine/core";
import { cn } from "cn";
import dayjs from "dayjs";
import { type FC, memo, useMemo } from "react";
import { useRelativeTimeFormatter } from "../../i18n/model/use-relative-time-formatter.ts";

export const NextPaymentAt: FC<NextPaymentDateAtProps> = memo(
  ({ nextPaymentAt }) => {
    const nextPaymentAtDayJs = useMemo(
      () => dayjs(nextPaymentAt),
      [nextPaymentAt],
    );

    const diffInDays = nextPaymentAtDayJs.diff(startOfToday, "days");

    const relativeTimeFormatter = useRelativeTimeFormatter();

    return (
      <Text
        size="sm"
        className={cn("block truncate")}
        c="dimmed"
      >
        {nextPaymentAtDayJs.format("D MMM")} •{" "}
        {relativeTimeFormatter.format(diffInDays, "days")}
      </Text>
    );
  },
);

export interface NextPaymentDateAtProps {
  nextPaymentAt: Date;
}
