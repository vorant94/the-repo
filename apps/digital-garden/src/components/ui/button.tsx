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
        "cursor-pointer p-1 hover:text-cyan-500",
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
    "border rounded-2xl hover:outline-solid outline-cyan-500 hover:border-cyan-500",
  default: "",
} as const satisfies Record<ButtonVariant, string>;
