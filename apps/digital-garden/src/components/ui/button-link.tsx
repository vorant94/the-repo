import { cn } from "cn";
import type { AnchorHTMLAttributes, FC, PropsWithChildren } from "react";

export const buttonLinkVariants = ["default", "outlined"] as const;
export type ButtonLinkVariant = (typeof buttonLinkVariants)[number];

export const buttonLinkSizes = ["md", "sm"] as const;
export type ButtonLinkSize = (typeof buttonLinkSizes)[number];

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonLinkVariant;
  size?: ButtonLinkSize;
}

export const ButtonLink: FC<PropsWithChildren<ButtonLinkProps>> = ({
  variant = "default",
  size = "md",
  className,
  href,
  children,
  ...rest
}) => {
  return (
    <a
      className={cn(
        "p-1 hover:text-cyan-500",
        buttonLinkVariantToStyle[variant],
        buttonLinkSizeToStyles[size],
        className,
      )}
      href={href}
      data-astro-prefetch
      {...rest}
    >
      {children}
    </a>
  );
};

const buttonLinkVariantToStyle = {
  default: "",
  outlined:
    "border rounded-2xl hover:outline-solid outline-cyan-500 hover:border-cyan-500",
} as const satisfies Record<ButtonLinkVariant, string>;

const buttonLinkSizeToStyles = {
  sm: "text-sm font-light",
  md: "",
} as const satisfies Record<ButtonLinkSize, string>;
