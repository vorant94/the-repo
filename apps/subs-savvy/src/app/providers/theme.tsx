import { cn } from "@/shared/ui/cn.ts";
import { Card, Drawer, type MantineThemeOverride } from "@mantine/core";

export const theme = {
  components: {
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    Card: Card.extend({
      defaultProps: {
        padding: "lg",
        radius: "md",
      },
    }),
    // biome-ignore lint/style/useNamingConvention: 3-rd party type
    Drawer: Drawer.extend({
      classNames: {
        content: cn("flex flex-col"),
        body: cn("flex flex-1 flex-col"),
      },
    }),
  },
} as const satisfies MantineThemeOverride;
