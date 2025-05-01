import type { StateCreator as ZustandStateCreator } from "zustand";
import type {
  CategoryModel,
  UpsertCategoryModel,
} from "../api/category.model.ts";
import type { RecoveryModel } from "../api/recovery.model.ts";
import type {
  SubscriptionModel,
  UpsertSubscriptionModel,
} from "../api/subscription.model.ts";

export interface SubscriptionsState {
  subscriptions: ReadonlyArray<SubscriptionModel>;
}

export interface CategoriesState {
  categories: ReadonlyArray<CategoryModel>;
  selectedCategory: CategoryModel | null;
}

export const importRecoveryStages = [
  "upload-recovery",
  "submit-categories",
  "submit-subscriptions",
  "failed",
  "completed",
] as const;
export type ImportRecoveryStage = (typeof importRecoveryStages)[number];

export interface ImportRecoveryState {
  importStage: ImportRecoveryStage;
  categoriesToImport: Array<CategoryModel>;
  subscriptionsToImport: Array<SubscriptionModel>;
}

export type UpsertCategoryState =
  | {
      upsertCategoryMode: "update";
      categoryToUpsert: CategoryModel;
    }
  | {
      upsertCategoryMode: "insert" | null;
      categoryToUpsert: null;
    };

export type UpsertSubscriptionState =
  | {
      upsertSubscriptionMode: "update";
      subscriptionToUpsert: SubscriptionModel;
    }
  | {
      upsertSubscriptionMode: "insert" | null;
      subscriptionToUpsert: null;
    };

export type State = SubscriptionsState &
  CategoriesState &
  ImportRecoveryState &
  UpsertCategoryState &
  UpsertSubscriptionState;

export interface CategoriesActions {
  selectCategory: (categoryId: string) => void;
  deselectCategory: () => void;
}

export interface ImportRecoveryActions {
  goNextFromUploadRecovery(recovery: RecoveryModel): void;
  goPrevFromSubmitCategories(): void;
  goNextFromSubmitCategories(categories: Array<CategoryModel>): void;
  goPrevFromSubmitSubscriptions(subscriptions: Array<SubscriptionModel>): void;
  goNextFromSubmitSubscriptions(
    subscriptions: Array<SubscriptionModel>,
  ): Promise<void>;
}

export interface UpsertCategoryActions {
  openUpsertCategory(category?: CategoryModel | null): void;
  closeUpsertCategory(): void;
  upsertCategory(raw: UpsertCategoryModel): Promise<void>;
}
export interface UpsertSubscriptionActions {
  openUpsertSubscription(subscription?: SubscriptionModel | null): void;
  closeUpsertSubscription(): void;
  upsertSubscription(raw: UpsertSubscriptionModel): Promise<void>;
  deleteSubscription(): Promise<void>;
}

export type Actions = CategoriesActions &
  ImportRecoveryActions &
  UpsertCategoryActions &
  UpsertSubscriptionActions;

export type Store = State & Actions;

export type StateCreator<T extends object> = ZustandStateCreator<
  Store,
  [["zustand/devtools", never], ["zustand/immer", never]],
  [["zustand/immer", never], ["zustand/devtools", never]],
  T
>;
