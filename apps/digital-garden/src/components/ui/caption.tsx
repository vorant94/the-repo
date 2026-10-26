import { cn } from "cn";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

interface CaptionProps extends HTMLAttributes<HTMLSpanElement> {}

export const Caption: FC<PropsWithChildren<CaptionProps>> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <span
      className={cn("text-sm text-slate-500", className)}
      {...rest}
    >
      {children}
    </span>
  );
};
