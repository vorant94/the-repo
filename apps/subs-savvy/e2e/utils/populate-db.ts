import type { Page } from "@playwright/test";
import type { CategoryModel } from "../../src/shared/api/category.model.ts";
import type { SubscriptionModel } from "../../src/shared/api/subscription.model.ts";

export async function populateDb(
  page: Page,
  subscriptions: ReadonlyArray<SubscriptionModel> = [],
  categories: ReadonlyArray<CategoryModel> = [],
): Promise<void> {
  await page.evaluate(
    async ([subscriptions, categories]) => {
      await window.db.transaction(
        "rw",
        window.db.subscriptions,
        window.db.categories,
        async () => {
          const subscriptionPuts: Array<Promise<unknown>> = [];
          const categoryPuts: Array<Promise<unknown>> = [];

          for (const { category, ...subscription } of subscriptions) {
            subscriptionPuts.push(
              window.db.subscriptions.put({
                ...subscription,
                categoryId: category?.id,
              }),
            );

            if (category) {
              categoryPuts.push(window.db.categories.put(category));
            }
          }

          for (const category of categories) {
            categoryPuts.push(window.db.categories.put(category));
          }

          await Promise.all([...subscriptionPuts, ...categoryPuts]);
        },
      );
    },
    [subscriptions, categories] as const,
  );
}
