import type { IconProps as TablerIconProps } from "@tabler/icons-react";
import { cn } from "cn";
import { type FC, memo } from "react";

// the goal of this wrapper is to apply some defaults
export const Icon: FC<IconProps> = memo(
  ({ icon: TablerIcon, className, ...props }) => {
    return (
      <TablerIcon
        className={cn("inline-block", className)}
        size="1em"
        {...props}
      />
    );
  },
);

export interface IconProps extends TablerIconProps {
  icon: FC<TablerIconProps>;
}
