import { db } from "../lib/db.ts";
import type { CategoryModel } from "./category.model.ts";
import { CategoryNotFound } from "./category.table.ts";
import type { SubscriptionModel } from "./subscription.model.ts";

export function upsertCategoriesAndSubscriptions(
  categories: Array<CategoryModel>,
  subscriptions: Array<SubscriptionModel>,
): Promise<void> {
  return db.transaction("rw", db.subscriptions, db.categories, async () => {
    const categoryPuts = categories.map((category) =>
      db.categories.put(category),
    );

    const categoryIds = new Set(categories.map(({ id }) => id));
    const subscriptionPuts = subscriptions.map(
      ({ category, ...subscription }) => {
        if (category && !categoryIds.has(category.id)) {
          throw new CategoryNotFound(category.id);
        }

        return db.subscriptions.put({
          ...subscription,
          categoryId: category?.id ?? null,
        });
      },
    );

    await Promise.all([...categoryPuts, ...subscriptionPuts]);
  });
}
