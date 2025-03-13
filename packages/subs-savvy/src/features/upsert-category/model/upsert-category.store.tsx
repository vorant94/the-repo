import type {
  CategoryModel,
  InsertCategoryModel,
  UpdateCategoryModel,
  UpsertCategoryModel,
} from "@/shared/api/category.model.ts";
import { insertCategory, updateCategory } from "@/shared/api/category.table.ts";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export function useUpsertCategory(): UpsertCategoryState {
  return useStore(useShallow(selectState));
}

export type UpsertCategoryState =
  | {
      mode: "update";
      category: CategoryModel;
    }
  | {
      mode: "insert" | null;
      category: null;
    };

export function useUpsertCategoryMode(): UpsertCategoryState["mode"] {
  return useStore(selectMode);
}

export function useUpsertCategoryActions(): UpsertCategoryActions {
  return useStore(useShallow(selectActions));
}

export interface UpsertCategoryActions {
  open(category?: CategoryModel | null): void;
  close(): void;
  upsert(raw: UpsertCategoryModel): Promise<void>;
}

// not using combine middleware to then infer the type of the store
// because state should be discriminated union
const useStore = create<Store>()(
  devtools(
    (set, get) => ({
      mode: null,
      category: null,
      open(category) {
        return set(
          category
            ? {
                category,
                mode: "update",
              }
            : {
                category: null,
                mode: "insert",
              },
          undefined,
          { type: "open", category },
        );
      },
      close() {
        return set(
          {
            mode: null,
            category: null,
          },
          undefined,
          { type: "close" },
        );
      },
      async upsert(raw) {
        const store = get();

        store.mode === "update"
          ? await updateCategory(raw as UpdateCategoryModel)
          : await insertCategory(raw as InsertCategoryModel);

        store.close();
        set({}, undefined, { type: "upsert", raw });
      },
    }),
    { name: "UpsertCategory", enabled: import.meta.env.DEV },
  ),
);

type Store = UpsertCategoryState & UpsertCategoryActions;

function selectState({ category, mode }: Store): UpsertCategoryState {
  return { category, mode } as UpsertCategoryState;
}

function selectMode({ mode }: Store): UpsertCategoryState["mode"] {
  return mode;
}

function selectActions({ open, close, upsert }: Store): UpsertCategoryActions {
  return { open, close, upsert };
}
