import { vi } from "vitest";
import { categoryMock } from "../../../../shared/api/__mocks__/category.model.ts";
import type { CategoryModel } from "../../../../shared/api/category.model.ts";
import type { UseSelectedCategory } from "../categories.store.tsx";

export const useCategories = vi.fn(() => [
  categoryMock,
]) satisfies () => ReadonlyArray<CategoryModel>;

export const selectCategorySpy = vi.fn() satisfies UseSelectedCategory[1];

export const useSelectedCategory = vi.fn(
  () => [null, selectCategorySpy] as const,
) satisfies () => UseSelectedCategory;
