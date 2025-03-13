import {
  monthlySubscription,
  yearlySubscription,
} from "@/shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "@/shared/api/subscription.model.ts";
import { vi } from "vitest";

export const useSubscriptions = vi.fn(() => [
  monthlySubscription,
  yearlySubscription,
]) satisfies () => ReadonlyArray<SubscriptionModel>;
