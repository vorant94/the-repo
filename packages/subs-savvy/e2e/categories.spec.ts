import { expect, test } from "@playwright/test";
import { categoryMock } from "../src/shared/api/__mocks__/category.model.ts";
import type {
  CategoryModel,
  InsertCategoryModel,
} from "../src/shared/api/category.model.ts";
import { SubscriptionsPom } from "./poms/subscriptions.pom.ts";
import { populateDb } from "./utils/populate-db.ts";

test.describe("categories", () => {
  test("should have no categories initially", async ({ page }) => {
    const pom = new SubscriptionsPom(page);

    await pom.goto();

    await pom.selectCategory.manageButton.click();

    await expect(pom.selectCategory.noCategoriesPlaceholder).toBeVisible();
  });

  test("should find existing categories", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const categories = [categoryMock];

    await pom.goto();
    await populateDb(page, undefined, categories);

    await pom.selectCategory.manageButton.click();

    for (const category of categories) {
      await expect(pom.selectCategory.category(category)).toBeVisible();
    }
  });

  test("should insert category", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const categoryToCreate = {
      ...categoryMock,
    } as const satisfies InsertCategoryModel;

    await pom.goto();

    await pom.selectCategory.manageButton.click();
    await pom.selectCategory.addButton.click();
    await pom.selectCategory.form.fill(categoryToCreate);
    await pom.selectCategory.insertButton.click();

    await expect(pom.selectCategory.category(categoryToCreate)).toBeVisible();
  });

  test("should update category", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const categoryToUpdate = {
      ...categoryMock,
    } as const satisfies InsertCategoryModel;
    const updatedCategory = {
      ...categoryToUpdate,
      name: "Housing",
    } as const satisfies InsertCategoryModel;

    await pom.goto();
    await populateDb(page, undefined, [categoryToUpdate]);

    await pom.selectCategory.manageButton.click();
    await pom.selectCategory.editButton(categoryToUpdate).click();
    await pom.selectCategory.form.fill(updatedCategory);
    await pom.selectCategory.updateButton.click();

    await expect(
      pom.selectCategory.category(categoryToUpdate),
    ).not.toBeVisible();
    await expect(pom.selectCategory.category(updatedCategory)).toBeVisible();
  });

  test("should delete category", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const categoryToDelete = {
      ...categoryMock,
    } as const satisfies CategoryModel;

    await pom.goto();
    await populateDb(page, undefined, [categoryToDelete]);

    await pom.selectCategory.manageButton.click();
    await pom.selectCategory.deleteButton(categoryToDelete).click();

    await expect(
      pom.selectCategory.category(categoryToDelete),
    ).not.toBeVisible();
  });
});
