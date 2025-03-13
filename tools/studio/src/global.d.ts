import "react";

declare module "react" {
  // biome-ignore lint/style/useNamingConvention: 3-rd party type
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
