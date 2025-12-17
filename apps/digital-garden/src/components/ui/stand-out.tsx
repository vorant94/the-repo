import { cn } from "cn";
import type { FC, PropsWithChildren } from "react";
import { Card, type CardProps } from "./card";

interface StandOutProps extends CardProps {}

export const StandOut: FC<PropsWithChildren<StandOutProps>> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <Card
      className={cn("mx-3", className)}
      {...rest}
    >
      {children}
    </Card>
  );
};
