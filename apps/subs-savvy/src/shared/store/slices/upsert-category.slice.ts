import type {
  InsertCategoryModel,
  UpdateCategoryModel,
} from "../../api/category.model.ts";
import { insertCategory, updateCategory } from "../../api/category.table.ts";
import type {
  StateCreator,
  UpsertCategoryActions,
  UpsertCategoryState,
} from "../types.ts";

export const createUpsertCategorySlice: StateCreator<
  UpsertCategoryState & UpsertCategoryActions
> = (set, get) => ({
  upsertCategoryMode: null,
  categoryToUpsert: null,
  openUpsertCategory(category) {
    return set(
      category
        ? {
            categoryToUpsert: category,
            upsertCategoryMode: "update",
          }
        : {
            categoryToUpsert: null,
            upsertCategoryMode: "insert",
          },
      undefined,
      { type: "openUpsertCategory", category },
    );
  },
  closeUpsertCategory() {
    return set(
      {
        upsertCategoryMode: null,
        categoryToUpsert: null,
      },
      undefined,
      { type: "closeUpsertCategory" },
    );
  },
  async upsertCategory(raw) {
    const store = get();

    store.upsertCategoryMode === "update"
      ? await updateCategory(raw as UpdateCategoryModel)
      : await insertCategory(raw as InsertCategoryModel);

    store.closeUpsertCategory();
    set({}, undefined, { type: "upsertCategory", raw });
  },
});
