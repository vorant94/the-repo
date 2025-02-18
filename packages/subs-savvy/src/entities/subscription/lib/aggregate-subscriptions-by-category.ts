import type { CategoryModel } from "../../../shared/api/category.model.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { compareSubscriptionsDesc } from "./compare-subscriptions.ts";

export function aggregateSubscriptionsByCategory(
  subscriptions: ReadonlyArray<SubscriptionModel>,
  calculateSubscriptionPrice: (subscription: SubscriptionModel) => number,
): Array<SubscriptionsAggregatedByCategory> {
  const subscriptionsByCategory: Array<SubscriptionsAggregatedByCategory> = [];

  for (const subscription of subscriptions) {
    const price = calculateSubscriptionPrice(subscription);
    if (price === 0) {
      continue;
    }

    const subByCategory = subscriptionsByCategory.find((agg) =>
      subscription?.category
        ? agg.category.id === subscription.category.id
        : agg.category.id === noCategoryPlaceholder.id,
    );
    if (!subByCategory) {
      subscriptionsByCategory.push({
        category: subscription.category ?? noCategoryPlaceholder,
        totalExpenses: price,
        subscriptions: [subscription],
      });
      continue;
    }

    subByCategory.totalExpenses += price;
    subByCategory.subscriptions.push(subscription);
  }

  for (const subsByCategory of subscriptionsByCategory) {
    subsByCategory.subscriptions.sort(compareSubscriptionsDesc);
  }

  return subscriptionsByCategory.toSorted((a, b) =>
    a.totalExpenses < b.totalExpenses ? 1 : -1,
  );
}

export interface SubscriptionsAggregatedByCategory {
  totalExpenses: number;
  subscriptions: Array<SubscriptionModel>;
  category: CategoryModel;
}

export const noCategoryPlaceholder = {
  id: -1,
  name: "no-category",
  color: "#777777",
} as const satisfies CategoryModel;
