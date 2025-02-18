import { useLiveQuery } from "dexie-react-hooks";
import { type PropsWithChildren, memo, useEffect } from "react";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { CategoryModel } from "../../../shared/api/category.model.ts";
import {
  CategoryNotFound,
  findCategories,
} from "../../../shared/api/category.table.ts";

export function useCategories(): ReadonlyArray<CategoryModel> {
  return useStore(selectCategories);
}

export function useSelectedCategory(): UseSelectedCategory {
  return useStore(useShallow(selectSelectedCategory));
}

export type UseSelectedCategory = Readonly<
  [CategoryModel | null, (categoryId: string | null) => void]
>;

export const CategoriesProvider = memo(({ children }: PropsWithChildren) => {
  const { setCategories } = useStore();

  const categories = useLiveQuery(() => findCategories(), [], []);
  useEffect(() => setCategories(categories), [categories, setCategories]);

  return <>{children}</>;
});

const useStore = create(
  devtools(
    combine(
      {
        categories: [] as ReadonlyArray<CategoryModel>,
        selectedCategory: null as CategoryModel | null,
      },
      (set) => ({
        setCategories(categories: ReadonlyArray<CategoryModel>): void {
          set({ categories }, undefined, { type: "setCategories", categories });
        },
        selectCategory(categoryId: string | null): void {
          set(
            ({ categories }) => {
              if (categoryId) {
                const categoryToSelect = categories.find(
                  (category) => `${category.id}` === categoryId,
                );

                if (!categoryToSelect) {
                  throw new CategoryNotFound(+categoryId);
                }

                return {
                  selectedCategory: categoryToSelect,
                };
              }

              return {
                selectedCategory: null,
              };
            },
            undefined,
            { type: "selectCategory", categoryId },
          );
        },
      }),
    ),
    { name: "Categories", enabled: import.meta.env.DEV },
  ),
);

type Store = ReturnType<(typeof useStore)["getState"]>;

function selectCategories({ categories }: Store): ReadonlyArray<CategoryModel> {
  return categories;
}

function selectSelectedCategory({
  selectedCategory,
  selectCategory,
}: Store): UseSelectedCategory {
  return [selectedCategory, selectCategory];
}
