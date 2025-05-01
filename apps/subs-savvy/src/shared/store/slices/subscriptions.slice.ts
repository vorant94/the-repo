import type { StateCreator, SubscriptionsState } from "../types.ts";

export const createSubscriptionSlice: StateCreator<
  SubscriptionsState
> = () => ({
  subscriptions: [],
});
