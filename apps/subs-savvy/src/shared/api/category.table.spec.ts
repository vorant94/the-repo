import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "../lib/db.ts";
import { cleanUpDb } from "../test/clean-up-db.ts";
import { populateDb } from "../test/populate-db.ts";
import { categoryMock } from "./__mocks__/category.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "./__mocks__/subscription.model.ts";
import type { CategoryModel } from "./category.model.ts";
import {
  deleteCategory,
  findCategories,
  insertCategory,
  updateCategory,
} from "./category.table.ts";

describe("with data", () => {
  beforeEach(
    async () => await populateDb([monthlySubscription, yearlySubscription]),
  );

  afterEach(async () => await cleanUpDb());

  it("should find categories", async () => {
    const categories = [categoryMock] satisfies ReadonlyArray<CategoryModel>;

    expect(await findCategories()).toEqual(categories);
  });

  it("should update category", async () => {
    const categoryToUpdate = {
      ...categoryMock,
      name: "Car",
    } satisfies CategoryModel;

    await updateCategory(categoryToUpdate);

    expect(await db.categories.get(categoryToUpdate.id)).toEqual(
      categoryToUpdate,
    );
  });

  it("should delete category and unlink all linked to it subscriptions", async () => {
    const categoryToDelete = { ...categoryMock } satisfies CategoryModel;

    await deleteCategory(categoryToDelete.id);

    expect(await db.categories.get(categoryToDelete.id)).toBeFalsy();
    expect(
      (
        await db.subscriptions
          .where({ categoryId: categoryToDelete.id })
          .toArray()
      ).length,
    ).toEqual(0);
  });
});

describe("without data", () => {
  afterEach(async () => await cleanUpDb());

  it("should insert category", async () => {
    const { id: _, ...categoryToInsert } = {
      ...categoryMock,
    } satisfies CategoryModel;

    const { id } = await insertCategory(categoryToInsert);

    expect(await db.categories.get(id)).toEqual({ ...categoryToInsert, id });
  });
});
