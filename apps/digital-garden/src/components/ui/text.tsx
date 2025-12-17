import { cn } from "cn";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";

export const textTags = ["span", "strong", "em"] as const;
export type TextTag = (typeof textTags)[number];

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  as: TextTag;
}

export const Text: FC<PropsWithChildren<TextProps>> = ({
  as: Tag,
  className,
  children,
  ...rest
}) => {
  return (
    <Tag
      className={cn(
        "text-slate-800 dark:text-slate-100",
        textTagToStyle[Tag],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const textTagToStyle = {
  span: "",
  strong: "font-semibold",
  em: "font-light",
} as const satisfies Record<TextTag, string>;
