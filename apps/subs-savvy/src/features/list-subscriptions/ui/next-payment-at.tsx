import { Text } from "@mantine/core";
import { cn } from "cn";
import { differenceInDays, format } from "date-fns";
import type { FC } from "react";
import { startOfToday } from "../../../shared/lib/dates.ts";
import { useRelativeTimeFormatter } from "../../i18n/model/use-relative-time-formatter.ts";

export const NextPaymentAt: FC<NextPaymentDateAtProps> = ({
  nextPaymentAt,
}) => {
  const diffInDays = differenceInDays(nextPaymentAt, startOfToday);

  const relativeTimeFormatter = useRelativeTimeFormatter();

  return (
    <Text
      size="sm"
      className={cn("block truncate")}
      c="dimmed"
    >
      {format(nextPaymentAt, "d MMM")} •{" "}
      {relativeTimeFormatter.format(diffInDays, "days")}
    </Text>
  );
};

export interface NextPaymentDateAtProps {
  nextPaymentAt: Date;
}
