import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";
import type { CategoryModel } from "../api/category.model.ts";
import type { SubscriptionModel } from "../api/subscription.model.ts";
import { createCategoriesSlice } from "./slices/categories.slice.ts";
import { createImportRecoverySlice } from "./slices/import-recovery.slice.ts";
import { createSubscriptionSlice } from "./slices/subscriptions.slice.ts";
import { createUpsertCategorySlice } from "./slices/upsert-category.slice.ts";
import { createUpsertSubscriptionSlice } from "./slices/upsert-subscription.slice.ts";
import type {
  ImportRecoveryState,
  Store,
  UpsertCategoryState,
  UpsertSubscriptionState,
} from "./types.ts";

export const useStore = create<Store>()(
  devtools(
    immer((...args) => ({
      ...createSubscriptionSlice(...args),
      ...createCategoriesSlice(...args),
      ...createImportRecoverySlice(...args),
      ...createUpsertCategorySlice(...args),
      ...createUpsertSubscriptionSlice(...args),
    })),
    { name: "store", enabled: import.meta.env.DEV },
  ),
);

export function useSubscriptions(): ReadonlyArray<SubscriptionModel> {
  return useStore(
    useShallow(({ selectedCategory, subscriptions }) => {
      if (!selectedCategory) {
        return subscriptions;
      }

      return subscriptions.filter(
        ({ category }) => category?.id === selectedCategory.id,
      );
    }),
  );
}

export function useCategories(): ReadonlyArray<CategoryModel> {
  return useStore(({ categories }) => categories);
}

export function useSelectedCategory(): CategoryModel | null {
  return useStore(({ selectedCategory }) => selectedCategory);
}

export function useImportRecovery(): ImportRecoveryState {
  return useStore(
    useShallow(
      ({ importStage, categoriesToImport, subscriptionsToImport }) => ({
        importStage,
        categoriesToImport,
        subscriptionsToImport,
      }),
    ),
  );
}

export function useUpsertCategory(): UpsertCategoryState {
  return useStore(
    useShallow(
      ({ upsertCategoryMode, categoryToUpsert }) =>
        ({
          upsertCategoryMode,
          categoryToUpsert,
        }) as UpsertCategoryState,
    ),
  );
}

export function useUpsertSubscription(): UpsertSubscriptionState {
  return useStore(
    useShallow(
      ({ upsertSubscriptionMode, subscriptionToUpsert }) =>
        ({
          upsertSubscriptionMode,
          subscriptionToUpsert,
        }) as UpsertSubscriptionState,
    ),
  );
}
