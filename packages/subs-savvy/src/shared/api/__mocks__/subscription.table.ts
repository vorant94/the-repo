import { vi } from "vitest";
import type { SubscriptionModel } from "../subscription.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "./subscription.model.ts";

export const findSubscriptions = vi.fn(async () => [
  monthlySubscription,
  yearlySubscription,
]) satisfies () => Promise<ReadonlyArray<SubscriptionModel>>;
