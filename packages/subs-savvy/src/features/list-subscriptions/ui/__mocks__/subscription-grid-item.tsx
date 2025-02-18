import { vi } from "vitest";
import type { SubscriptionGridItemProps } from "../subscription-grid-item.tsx";

export const SubscriptionGridItem = vi.fn(
  ({ subscription }: SubscriptionGridItemProps) => {
    return <div data-testid={subscription.id} />;
  },
);
