import { cn } from "cn";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card: FC<PropsWithChildren<CardProps>> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "relative flex gap-3 rounded-md border border-slate-300 bg-slate-50 p-5 dark:border-slate-600 dark:bg-slate-900",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
