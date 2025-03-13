import type { CategoryModel } from "../api/category.model.ts";
import type { SubscriptionModel } from "../api/subscription.model.ts";
import { db } from "../lib/db.ts";

// utility function for tests only
export async function populateDb(
  subscriptions: ReadonlyArray<SubscriptionModel> = [],
  categories: ReadonlyArray<CategoryModel> = [],
): Promise<void> {
  await db.transaction("rw", db.subscriptions, db.categories, async () => {
    const subscriptionPuts: Array<Promise<unknown>> = [];
    const categoryPuts: Array<Promise<unknown>> = [];

    for (const { category, ...subscription } of subscriptions) {
      subscriptionPuts.push(
        db.subscriptions.put({
          ...subscription,
          categoryId: category?.id,
        }),
      );

      if (category) {
        categoryPuts.push(db.categories.put(category));
      }
    }

    for (const category of categories) {
      categoryPuts.push(db.categories.put(category));
    }

    await Promise.all([...subscriptionPuts, ...categoryPuts]);
  });
}
