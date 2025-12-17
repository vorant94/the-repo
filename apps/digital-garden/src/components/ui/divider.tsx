import { cn } from "cn";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  isLeft?: boolean;
  isRight?: boolean;
}

export const Divider: FC<PropsWithChildren<DividerProps>> = ({
  isLeft = true,
  isRight = true,
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={cn("relative flex items-center py-5", className)}
      {...rest}
    >
      {isLeft && (
        <div className="grow border-slate-300 border-t dark:border-slate-600" />
      )}

      <div
        className={cn("shrink", {
          "ml-4": isLeft,
          "mr-4": isRight,
        })}
      >
        {children}
      </div>

      {isRight && (
        <div className="grow border-slate-300 border-t dark:border-slate-600" />
      )}
    </div>
  );
};
