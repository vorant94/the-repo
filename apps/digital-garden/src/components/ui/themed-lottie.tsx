import { Player } from "@lottiefiles/react-lottie-player";
import { cn } from "cn";
import type { FC, HTMLAttributes } from "react";

export interface ThemedLottieProps extends HTMLAttributes<HTMLElement> {
  src: string;
  srcDark: string;
  autoplay?: boolean;
}

export const ThemedLottie: FC<ThemedLottieProps> = ({
  src,
  srcDark,
  autoplay = true,
  className,
  ...rest
}) => {
  return (
    <>
      <Player
        className={cn("dark:hidden", className)}
        src={src}
        autoplay={autoplay}
        {...rest}
      />
      <Player
        className={cn("hidden dark:flex", className)}
        src={srcDark}
        autoplay={autoplay}
        {...rest}
      />
    </>
  );
};
