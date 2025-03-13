import type { SubscriptionModel } from "@/shared/api/subscription.model.ts";
import { findSubscriptions } from "@/shared/api/subscription.table.ts";
import { useLiveQuery } from "dexie-react-hooks";
import { type PropsWithChildren, memo, useEffect, useMemo } from "react";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { useSelectedCategory } from "../../category/model/categories.store.tsx";

export function useSubscriptions(): ReadonlyArray<SubscriptionModel> {
  return useStore(selectSubscriptions);
}

export const SubscriptionsProvider = memo(({ children }: PropsWithChildren) => {
  const [selectedCategory] = useSelectedCategory();
  const { setSubscriptions } = useStore();

  const unfilteredSubscriptions = useLiveQuery(
    () => findSubscriptions(),
    [],
    [],
  );
  const subscriptions = useMemo(() => {
    if (!selectedCategory) {
      return unfilteredSubscriptions;
    }

    return unfilteredSubscriptions.filter(
      ({ category }) => category?.id === selectedCategory.id,
    );
  }, [selectedCategory, unfilteredSubscriptions]);
  useEffect(
    () => setSubscriptions(subscriptions),
    [subscriptions, setSubscriptions],
  );

  return <>{children}</>;
});

const useStore = create(
  devtools(
    combine(
      {
        subscriptions: [] as ReadonlyArray<SubscriptionModel>,
      },
      (set) => ({
        setSubscriptions(
          subscriptions: ReadonlyArray<SubscriptionModel>,
        ): void {
          set({ subscriptions }, undefined, {
            type: "setSubscriptions",
            subscriptions,
          });
        },
      }),
    ),
    { name: "Subscriptions", enabled: import.meta.env.DEV },
  ),
);

type Store = ReturnType<(typeof useStore)["getState"]>;

function selectSubscriptions({
  subscriptions,
}: Store): ReadonlyArray<SubscriptionModel> {
  return subscriptions;
}
