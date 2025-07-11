import { afterEach, describe, expect, it } from "vitest";
import { db, type RawSubscriptionModel } from "../lib/db.ts";
import { cleanUpDb } from "../test/clean-up-db.ts";
import { categoryMock } from "./__mocks__/category.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "./__mocks__/subscription.model.ts";
import type { CategoryModel } from "./category.model.ts";
import { upsertCategoriesAndSubscriptions } from "./recovery.table.ts";
import type { SubscriptionModel } from "./subscription.model.ts";

describe("recovery.table", () => {
  afterEach(async () => await cleanUpDb());

  it("should upsert categories and subscriptions", async () => {
    const categories = [categoryMock] satisfies Array<CategoryModel>;
    const subscriptions = [
      monthlySubscription,
      yearlySubscription,
    ] satisfies Array<SubscriptionModel>;

    await upsertCategoriesAndSubscriptions(categories, subscriptions);

    const rawSubscriptions = subscriptions.map(
      ({ category, ...subscription }) => ({
        ...subscription,
        categoryId: category?.id ?? null,
      }),
    ) satisfies Array<RawSubscriptionModel>;

    expect(await db.categories.toArray()).toEqual(categories);
    expect(await db.subscriptions.toArray()).toEqual(rawSubscriptions);
  });
});
