import type { DefaultMantineColor } from "@mantine/core";

export const notificationColor = {
  error: "red",
} as const satisfies Record<string, DefaultMantineColor>;
