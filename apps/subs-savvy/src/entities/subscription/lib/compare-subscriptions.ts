import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";

export const compareSubscriptionsDesc = createCompareSubscriptions("desc");

// export const compareSubscriptionsAsc = createCompareSubscriptions("asc");

function createCompareSubscriptions(
  askOrDesc: AscOrDesc,
): (a: SubscriptionModel, b: SubscriptionModel) => number {
  return (a: SubscriptionModel, b: SubscriptionModel) => {
    return askOrDesc === "asc" ? a.price - b.price : b.price - a.price;
  };
}

type AscOrDesc = "desc" | "asc";
