import type { PropsWithFcChildren } from "@/shared/lib/props-with-fc-children.ts";
import { vi } from "vitest";
import type {
  SubscriptionGridChildrenProps,
  SubscriptionGridProps,
} from "../subscription-grid.tsx";

export const SubscriptionGrid = vi.fn(
  ({
    subscriptions,
    children,
  }: PropsWithFcChildren<
    SubscriptionGridProps,
    SubscriptionGridChildrenProps
  >) => {
    return (
      <>{subscriptions.map((subscription) => children?.({ subscription }))}</>
    );
  },
);
