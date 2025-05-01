import { vi } from "vitest";
import { categoryMock } from "../../api/__mocks__/category.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "../../api/__mocks__/subscription.model.ts";
import type { CategoryModel } from "../../api/category.model.ts";
import type { SubscriptionModel } from "../../api/subscription.model.ts";

export const selectCategorySpy = vi.fn();

export const deselectCategorySpy = vi.fn();

export const useStore = {
  getState: vi.fn(() => ({
    selectCategory: selectCategorySpy,
    deselectCategory: deselectCategorySpy,
  })),
};

export const useCategories = vi.fn(() => [
  categoryMock,
]) satisfies () => ReadonlyArray<CategoryModel>;

export const useSelectedCategory = vi.fn(
  () => null,
) satisfies () => CategoryModel | null;

export const useSubscriptions = vi.fn(() => [
  monthlySubscription,
  yearlySubscription,
]) satisfies () => ReadonlyArray<SubscriptionModel>;
