import { cn } from "cn";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

const titleTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type TitleTag = (typeof titleTags)[number];

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as: TitleTag;
}

export const Title: FC<PropsWithChildren<TitleProps>> = ({
  as: Tag,
  className,
  children,
  ...rest
}) => {
  return (
    <Tag
      className={cn(
        "text-slate-800 dark:text-slate-100",
        titleTagToStyles[Tag],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const titleTagToStyles = {
  h1: "text-4xl font-extrabold",
  h2: "",
  h3: "text-2xl font-semibold",
  h4: "",
  h5: "",
  h6: " text-lg font-medium",
} as const satisfies Record<TitleTag, string>;
