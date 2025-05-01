import type { CategoryModel } from "../../api/category.model.ts";
import { CategoryNotFound } from "../../api/category.table.ts";
import type { RecoveryModel } from "../../api/recovery.model.ts";
import { upsertCategoriesAndSubscriptions } from "../../api/recovery.table.ts";
import type { SubscriptionModel } from "../../api/subscription.model.ts";
import type {
  ImportRecoveryActions,
  ImportRecoveryStage,
  ImportRecoveryState,
  StateCreator,
} from "../types.ts";

export const createImportRecoverySlice: StateCreator<
  ImportRecoveryState & ImportRecoveryActions
> = (set, get) => ({
  importStage: "upload-recovery",
  categoriesToImport: [],
  subscriptionsToImport: [],
  goNextFromUploadRecovery(recovery: RecoveryModel): void {
    const { categories, subscriptions } = recovery;
    const state = get();
    if (state.importStage !== "upload-recovery") {
      throw new IllegalTransitionError(state.importStage, "submit-categories");
    }

    set(
      (draft) => {
        draft.importStage = "submit-categories";
        draft.categoriesToImport = categories;
        draft.subscriptionsToImport = subscriptions;

        const categoryIds = new Set(categories.map(({ id }) => id));
        for (const subscription of subscriptions) {
          if (!subscription.category) {
            continue;
          }

          if (categoryIds.has(subscription.category.id)) {
            continue;
          }

          draft.categoriesToImport.push(subscription.category);
          categoryIds.add(subscription.category.id);
        }
      },
      undefined,
      { type: "goNextFromUploadRecovery", recovery },
    );
  },
  goPrevFromSubmitCategories(): void {
    const state = get();
    if (state.importStage !== "submit-categories") {
      throw new IllegalTransitionError(state.importStage, "upload-recovery");
    }

    set(
      (draft) => {
        draft.importStage = "upload-recovery";
        draft.categoriesToImport = [];
        draft.subscriptionsToImport = [];
      },
      undefined,
      "goPrevFromSubmitCategories",
    );
  },
  goNextFromSubmitCategories(categories: Array<CategoryModel>): void {
    const state = get();
    if (state.importStage !== "submit-categories") {
      throw new IllegalTransitionError(
        state.importStage,
        "submit-subscriptions",
      );
    }

    set(
      (draft) => {
        draft.importStage = "submit-subscriptions";
        draft.categoriesToImport = categories;

        const categoryIdToCategory = new Map(
          categories.map((category) => [category.id, category]),
        );
        for (const subscription of draft.subscriptionsToImport) {
          if (!subscription.category) {
            continue;
          }

          if (!categoryIdToCategory.has(subscription.category.id)) {
            throw new CategoryNotFound(subscription.category.id);
          }

          subscription.category = categoryIdToCategory.get(
            subscription.category.id,
          );
        }
      },
      undefined,
      { type: "goNextFromSubmitCategories", categories },
    );
  },
  goPrevFromSubmitSubscriptions(subscriptions: Array<SubscriptionModel>): void {
    const state = get();
    if (state.importStage !== "submit-subscriptions") {
      throw new IllegalTransitionError(state.importStage, "submit-categories");
    }

    set(
      (draft) => {
        draft.importStage = "submit-categories";
        draft.subscriptionsToImport = subscriptions;
      },
      undefined,
      { type: "goPrevFromSubmitSubscriptions", subscriptions },
    );
  },
  async goNextFromSubmitSubscriptions(
    subscriptions: Array<SubscriptionModel>,
  ): Promise<void> {
    const state = get();
    if (state.importStage !== "submit-subscriptions") {
      throw new IllegalTransitionError(
        state.importStage,
        "submit-subscriptions",
      );
    }

    try {
      await upsertCategoriesAndSubscriptions(
        state.categoriesToImport,
        subscriptions,
      );

      set(
        (draft) => {
          draft.importStage = "completed";
        },
        undefined,
        { type: "goNextFromSubmitSubscriptions", subscriptions },
      );
    } catch (_e) {
      set(
        (draft) => {
          draft.importStage = "failed";
        },
        undefined,
        { type: "goNextFromSubmitSubscriptions", subscriptions },
      );
    }
  },
});

export class IllegalTransitionError extends Error {
  constructor(from: ImportRecoveryStage, to: ImportRecoveryStage) {
    super(`Illegal transition from "${from}" to "${to}"`);
  }
}
