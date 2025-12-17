import { cn } from "cn";
import type { AnchorHTMLAttributes, FC, PropsWithChildren } from "react";

const linkSizes = ["sm", "md"] as const;
type LinkSize = (typeof linkSizes)[number];

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  size?: LinkSize;
  isActive?: boolean;
}

export const Link: FC<PropsWithChildren<LinkProps>> = ({
  size = "md",
  className,
  href,
  isActive,
  children,
  ...rest
}) => {
  return (
    <a
      data-astro-prefetch
      className={cn(
        "text-slate-500 decoration-4 decoration-cyan-500 decoration-dotted underline-offset-4 hover:text-cyan-500 hover:underline group-hover:text-cyan-500 group-hover:underline",
        isActive && "text-cyan-500! underline",
        linkSizeToStyles[size],
        className,
      )}
      href={href}
      {...rest}
    >
      {children}
    </a>
  );
};

const linkSizeToStyles = {
  sm: "text-sm font-light",
  md: "",
} as const satisfies Record<LinkSize, string>;
