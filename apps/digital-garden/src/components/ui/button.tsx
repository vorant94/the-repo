import { cn } from "cn";
import type { ButtonHTMLAttributes, FC, PropsWithChildren } from "react";

const buttonVariants = ["default", "outlined"] as const;
type ButtonVariant = (typeof buttonVariants)[number];

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  variant = "default",
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={cn(
        "not-disabled:cursor-pointer p-1 not-disabled:hover:text-cyan-500 disabled:cursor-not-allowed",
        buttonVariantToStyles[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

const buttonVariantToStyles = {
  outlined:
    "border disabled:border-slate-500 rounded-2xl not-disabled:hover:outline-solid not-disabled:outline-cyan-500 not-disabled:hover:border-cyan-500",
  default: "",
} as const satisfies Record<ButtonVariant, string>;
