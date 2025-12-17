import { cn } from "cn";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export interface CaptionProps extends HTMLAttributes<HTMLSpanElement> {}

export const Caption: FC<PropsWithChildren<CaptionProps>> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <span
      className={cn("text-slate-500 text-sm", className)}
      {...rest}
    >
      {children}
    </span>
  );
};
