import { useSelectedCategory } from "@/entities/category/model/categories.store.tsx";
import type {
  InsertSubscriptionModel,
  SubscriptionModel,
  UpdateSubscriptionModel,
  UpsertSubscriptionModel,
} from "@/shared/api/subscription.model.ts";
import {
  deleteSubscription,
  insertSubscription,
  updateSubscription,
} from "@/shared/api/subscription.table.ts";
import { rootRoute } from "@/shared/lib/route.ts";
import { useDefaultLayout } from "@/shared/ui/default.layout.tsx";
import { usePrevious } from "@mantine/hooks";
import { type PropsWithChildren, memo, useEffect } from "react";
import { useLocation } from "react-router";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

export function useUpsertSubscription(): UpsertSubscriptionState {
  return useStore(useShallow(selectState));
}

export type UpsertSubscriptionState =
  | {
      mode: "update";
      subscription: SubscriptionModel;
    }
  | {
      mode: "insert" | null;
      subscription: null;
    };

export function useUpsertSubscriptionMode(): UpsertSubscriptionState["mode"] {
  return useStore(selectMode);
}

export function useUpsertSubscriptionActions(): UpsertSubscriptionActions {
  return useStore(useShallow(selectActions));
}

export interface UpsertSubscriptionActions {
  open(subscription?: SubscriptionModel | null): void;
  close(): void;
  upsert(raw: UpsertSubscriptionModel): Promise<void>;
  delete(): Promise<void>;
}

export const UpsertSubscriptionProvider = memo(
  ({ children }: PropsWithChildren) => {
    const { drawer, isDrawerOpened } = useDefaultLayout();
    const prevIsDrawerOpened = usePrevious(isDrawerOpened);

    const { mode, close } = useStore();
    const prevMode = usePrevious(mode);
    useEffect(() => {
      if (mode !== prevMode) {
        if (mode && !isDrawerOpened) {
          drawer.open();
        }
        if (!mode && isDrawerOpened) {
          drawer.close();
        }
      }

      if (isDrawerOpened !== prevIsDrawerOpened) {
        if (!isDrawerOpened && mode) {
          close();
        }
      }
    }, [
      drawer.close,
      drawer.open,
      isDrawerOpened,
      mode,
      close,
      prevMode,
      prevIsDrawerOpened,
    ]);

    const { pathname } = useLocation();
    const [selectedCategory, selectCategory] = useSelectedCategory();
    useEffect(
      () => () => {
        if (
          selectedCategory !== null &&
          pathname !== `/${rootRoute.dashboard}` &&
          pathname !== `/${rootRoute.subscriptions}`
        ) {
          selectCategory(null);
        }
      },
      [pathname, selectedCategory, selectCategory],
    );

    return <>{children}</>;
  },
);

// not using combine middleware to then infer the type of the store
// because state should be discriminated union
const useStore = create<Store>()(
  devtools(
    (set, get) => ({
      mode: null,
      subscription: null,
      open(subscription) {
        return set(
          subscription
            ? {
                subscription,
                mode: "update",
              }
            : {
                subscription: null,
                mode: "insert",
              },
          undefined,
          { type: "open", subscription },
        );
      },
      close() {
        return set(
          {
            mode: null,
            subscription: null,
          },
          undefined,
          { type: "close" },
        );
      },
      async upsert(raw) {
        const store = get();

        store.mode === "update"
          ? await updateSubscription(raw as UpdateSubscriptionModel)
          : await insertSubscription(raw as InsertSubscriptionModel);

        store.close();
        set({}, undefined, { type: "upsert", raw });
      },
      async delete() {
        const store = get();
        if (store.mode !== "update") {
          throw new Error("Nothing to delete in insert mode!");
        }

        await deleteSubscription(store.subscription.id);

        store.close();
        set({}, undefined, { type: "delete" });
      },
    }),
    { name: "UpsertSubscription", enabled: import.meta.env.DEV },
  ),
);

type Store = UpsertSubscriptionState & UpsertSubscriptionActions;

function selectMode({ mode }: Store): UpsertSubscriptionState["mode"] {
  return mode;
}

function selectState({ subscription, mode }: Store): UpsertSubscriptionState {
  return { subscription, mode } as UpsertSubscriptionState;
}

function selectActions({
  open,
  close,
  upsert,
  delete: deleteSubscription,
}: Store): UpsertSubscriptionActions {
  return { open, close, upsert, delete: deleteSubscription };
}
