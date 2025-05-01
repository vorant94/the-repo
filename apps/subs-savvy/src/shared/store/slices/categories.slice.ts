import { CategoryNotFound } from "../../api/category.table.ts";
import type {
  CategoriesActions,
  CategoriesState,
  StateCreator,
} from "../types.ts";

export const createCategoriesSlice: StateCreator<
  CategoriesState & CategoriesActions
> = (set, get) => ({
  categories: [],
  selectedCategory: null,
  selectCategory: (categoryId) => {
    const categoryToSelect = get().categories.find(
      (category) => `${category.id}` === categoryId,
    );

    if (!categoryToSelect) {
      throw new CategoryNotFound(+categoryId);
    }

    set(
      (draft) => {
        draft.selectedCategory = categoryToSelect;
      },
      undefined,
      { type: "selectCategory", categoryId },
    );
  },
  deselectCategory: () => {
    set(
      (draft) => {
        draft.selectedCategory = null;
      },
      undefined,
      { type: "deselectCategory" },
    );
  },
});
