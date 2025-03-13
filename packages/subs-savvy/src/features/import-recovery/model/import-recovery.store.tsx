import type { CategoryModel } from "@/shared/api/category.model.ts";
import { CategoryNotFound } from "@/shared/api/category.table.ts";
import type { RecoveryModel } from "@/shared/api/recovery.model.ts";
import { upsertCategoriesAndSubscriptions } from "@/shared/api/recovery.table.ts";
import type { SubscriptionModel } from "@/shared/api/subscription.model.ts";
import { rootRoute } from "@/shared/lib/route.ts";
import { type PropsWithChildren, memo, useEffect } from "react";
import { useLocation } from "react-router";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export function useImportRecovery(): ImportRecoveryState {
  return useStore(useShallow(selectState));
}

export function useImportRecoveryStage(): ImportRecoveryStateStage {
  return useStore(selectStage);
}

export const importRecoveryStateStages = [
  "upload-recovery",
  "submit-categories",
  "submit-subscriptions",
  "failed",
  "completed",
] as const;
export type ImportRecoveryStateStage =
  (typeof importRecoveryStateStages)[number];

export type ImportRecoveryState = Pick<
  Store,
  "stage" | "categories" | "subscriptions"
>;

export function useImportRecoveryActions(): ImportRecoveryActions {
  return useStore(useShallow(selectActions));
}

export type ImportRecoveryActions = Pick<
  Store,
  | "goNextFromUploadRecovery"
  | "goPrevFromSubmitCategories"
  | "goNextFromSubmitCategories"
  | "goPrevFromSubmitSubscriptions"
  | "goNextFromSubmitSubscriptions"
  | "reset"
>;

export const ImportRecoveryProvider = memo(
  ({ children }: PropsWithChildren) => {
    const { pathname } = useLocation();
    const stage = useImportRecoveryStage();
    const { reset } = useImportRecoveryActions();

    useEffect(
      () => () => {
        if (
          stage !== "upload-recovery" &&
          pathname !== `/${rootRoute.recovery}`
        ) {
          reset();
        }
      },
      [pathname, stage, reset],
    );

    return <>{children}</>;
  },
);

export class IllegalTransitionError extends Error {
  constructor(from: ImportRecoveryStateStage, to: ImportRecoveryStateStage) {
    super(`Illegal transition from "${from}" to "${to}"`);
  }
}

/**
 * @internal should not be used outside of its own unit tests
 */
export const useStore = create(
  devtools(
    combine(
      {
        stage: "upload-recovery" as ImportRecoveryStateStage,
        categories: [] as Array<CategoryModel>,
        subscriptions: [] as Array<SubscriptionModel>,
      },
      (set, get) => ({
        goNextFromUploadRecovery({
          categories,
          subscriptions,
        }: RecoveryModel): void {
          const state = get();
          if (state.stage !== "upload-recovery") {
            throw new IllegalTransitionError(state.stage, "submit-categories");
          }

          const categoryIds = new Set(categories.map(({ id }) => id));
          for (const subscription of subscriptions) {
            if (!subscription.category) {
              continue;
            }

            if (categoryIds.has(subscription.category.id)) {
              continue;
            }

            categories.push(subscription.category);
            categoryIds.add(subscription.category.id);
          }

          set(
            () => ({ stage: "submit-categories", categories, subscriptions }),
            undefined,
            "goNextFromUploadRecovery",
          );
        },
        goPrevFromSubmitCategories(): void {
          const state = get();
          if (state.stage !== "submit-categories") {
            throw new IllegalTransitionError(state.stage, "upload-recovery");
          }

          set(
            () => ({
              stage: "upload-recovery",
              categories: [],
              subscriptions: [],
            }),
            undefined,
            "goPrevFromSubmitCategories",
          );
        },
        goNextFromSubmitCategories(categories: Array<CategoryModel>): void {
          const state = get();
          if (state.stage !== "submit-categories") {
            throw new IllegalTransitionError(
              state.stage,
              "submit-subscriptions",
            );
          }

          const categoryIdToCategory = new Map(
            categories.map((category) => [category.id, category]),
          );
          const subscriptions = state.subscriptions.map((subscription) => {
            if (!subscription.category) {
              return subscription;
            }

            if (!categoryIdToCategory.has(subscription.category.id)) {
              throw new CategoryNotFound(subscription.category.id);
            }

            subscription.category = categoryIdToCategory.get(
              subscription.category.id,
            );
            return subscription;
          });

          set(
            () => ({
              stage: "submit-subscriptions",
              categories,
              subscriptions,
            }),
            undefined,
            "goNextFromSubmitCategories",
          );
        },
        goPrevFromSubmitSubscriptions(
          subscriptions: Array<SubscriptionModel>,
        ): void {
          const state = get();
          if (state.stage !== "submit-subscriptions") {
            throw new IllegalTransitionError(state.stage, "submit-categories");
          }

          set(
            () => ({
              stage: "submit-categories",
              subscriptions,
            }),
            undefined,
            "goPrevFromSubmitSubscriptions",
          );
        },
        async goNextFromSubmitSubscriptions(
          subscriptions: Array<SubscriptionModel>,
        ): Promise<void> {
          const state = get();
          if (state.stage !== "submit-subscriptions") {
            throw new IllegalTransitionError(
              state.stage,
              "submit-subscriptions",
            );
          }

          try {
            await upsertCategoriesAndSubscriptions(
              state.categories,
              subscriptions,
            );

            set(
              () => ({ stage: "completed" }),
              undefined,
              "goNextFromSubmitSubscriptions",
            );
          } catch (_e) {
            set(
              () => ({ stage: "failed" }),
              undefined,
              "goNextFromSubmitSubscriptions",
            );
          }
        },
        reset(): void {
          set(
            () => ({
              stage: "upload-recovery",
              categories: [],
              subscriptions: [],
            }),
            undefined,
            "reset",
          );
        },
      }),
    ),
    { name: "ImportRecovery", enabled: import.meta.env.DEV },
  ),
);

type Store = ReturnType<(typeof useStore)["getState"]>;

function selectState({
  stage,
  categories,
  subscriptions,
}: Store): ImportRecoveryState {
  return { stage, categories, subscriptions };
}

function selectStage({ stage }: Store): ImportRecoveryStateStage {
  return stage;
}

function selectActions({
  goNextFromUploadRecovery,
  goPrevFromSubmitCategories,
  goNextFromSubmitCategories,
  goPrevFromSubmitSubscriptions,
  goNextFromSubmitSubscriptions,
  reset,
}: Store): ImportRecoveryActions {
  return {
    goNextFromUploadRecovery,
    goPrevFromSubmitCategories,
    goNextFromSubmitCategories,
    goPrevFromSubmitSubscriptions,
    goNextFromSubmitSubscriptions,
    reset,
  };
}
