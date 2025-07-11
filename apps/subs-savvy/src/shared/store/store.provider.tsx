import { usePrevious } from "@mantine/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import { memo, type PropsWithChildren, useEffect } from "react";
import { useLocation } from "react-router";
import { findCategories } from "../api/category.table.ts";
import { findSubscriptions } from "../api/subscription.table.ts";
import { rootRoute } from "../lib/route.ts";
import { useDefaultLayout } from "../ui/default.layout.tsx";
import { useStore, useUpsertSubscription } from "./hooks.ts";

export const StoreProvider = memo(({ children }: PropsWithChildren) => {
  // sync subscriptions from indexeddb to store
  const subscriptions = useLiveQuery(() => findSubscriptions(), [], []);
  useEffect(() => {
    useStore.setState({ subscriptions });
  }, [subscriptions]);

  // sync categories from indexeddb to store
  const categories = useLiveQuery(() => findCategories(), [], []);
  useEffect(() => {
    useStore.setState({ categories });
  }, [categories]);

  // reset some parts of the store on route change
  const { pathname } = useLocation();
  useEffect(
    () => () => {
      const { importStage, selectedCategory } = useStore.getState();

      if (
        importStage !== "upload-recovery" &&
        pathname !== `/${rootRoute.recovery}`
      ) {
        useStore.setState({
          importStage: "upload-recovery",
          categoriesToImport: [],
          subscriptionsToImport: [],
        });
      }

      if (
        selectedCategory !== null &&
        pathname !== `/${rootRoute.dashboard}` &&
        pathname !== `/${rootRoute.subscriptions}`
      ) {
        useStore.setState({ selectedCategory: null });
      }
    },
    [pathname],
  );

  // two-way sync upsertSubscription state and whether drawer is open
  const { drawer, isDrawerOpened } = useDefaultLayout();
  const prevIsDrawerOpened = usePrevious(isDrawerOpened);
  const { upsertSubscriptionMode } = useUpsertSubscription();
  const prevUpsertSubscriptionMode = usePrevious(upsertSubscriptionMode);
  useEffect(() => {
    if (upsertSubscriptionMode !== prevUpsertSubscriptionMode) {
      if (upsertSubscriptionMode && !isDrawerOpened) {
        drawer.open();
      }
      if (!upsertSubscriptionMode && isDrawerOpened) {
        drawer.close();
      }
    }

    if (isDrawerOpened !== prevIsDrawerOpened) {
      if (!isDrawerOpened && upsertSubscriptionMode) {
        useStore.setState({
          upsertSubscriptionMode: null,
          subscriptionToUpsert: null,
        });
      }
    }
  }, [
    drawer.close,
    drawer.open,
    isDrawerOpened,
    upsertSubscriptionMode,
    prevUpsertSubscriptionMode,
    prevIsDrawerOpened,
  ]);

  return <>{children}</>;
});
