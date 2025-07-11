import { db } from "../lib/db.ts";
import {
  type CategoryModel,
  categorySchema,
  type InsertCategoryModel,
  insertCategorySchema,
  type UpdateCategoryModel,
  updateCategorySchema,
} from "./category.model.ts";

export function findCategories(): Promise<ReadonlyArray<CategoryModel>> {
  return db.transaction("r", db.categories, async () => {
    const raws = await db.categories.toArray();

    return raws.map((raw) => categorySchema.parse(raw));
  });
}

export function insertCategory(
  raw: InsertCategoryModel,
): Promise<CategoryModel> {
  return db.transaction("rw", db.categories, async () => {
    const parsed = insertCategorySchema.parse(raw);

    const id = await db.categories.add(parsed);
    return await _getCategory(id);
  });
}

export function updateCategory(
  raw: UpdateCategoryModel,
): Promise<CategoryModel> {
  return db.transaction("rw", db.categories, async () => {
    const { id, ...rest } = updateCategorySchema.parse(raw);

    await db.categories.update(id, rest);
    return await _getCategory(id);
  });
}

export function deleteCategory(id: number): Promise<void> {
  return db.transaction("rw", db.categories, db.subscriptions, async () => {
    const categorySubscriptions = await db.subscriptions
      .where({ categoryId: id })
      .toArray();
    const subscriptionUpdates = categorySubscriptions.map(
      ({ id, categoryId: _, ...rest }) =>
        db.subscriptions.update(id, { ...rest, categoryId: null }),
    );

    await Promise.all([db.categories.delete(id), ...subscriptionUpdates]);
  });
}

/**
 * @internal should not be used outside category.table, the exception is only another table module like subscription.table
 */
export async function _getCategory(id: number): Promise<CategoryModel> {
  const raw = await db.categories.get(id);
  if (!raw) {
    throw new CategoryNotFound(id);
  }

  return categorySchema.parse(raw);
}

export class CategoryNotFound extends Error {
  constructor(categoryId: number) {
    super(`Category with id ${categoryId} not found!`);
  }
}
