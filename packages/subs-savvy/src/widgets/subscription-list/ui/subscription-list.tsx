import { CloseButton, Divider, TextInput } from "@mantine/core";
import { memo, useCallback, useMemo, useState } from "react";
import { isSubscriptionExpired } from "../../../entities/subscription/lib/is-subscription-expired.ts";
import { useSubscriptions } from "../../../entities/subscription/model/subscriptions.store.tsx";
import { SubscriptionGridItem } from "../../../features/list-subscriptions/ui/subscription-grid-item.tsx";
import {
  SubscriptionGrid,
  type SubscriptionGridChildrenProps,
} from "../../../features/list-subscriptions/ui/subscription-grid.tsx";
import { useUpsertSubscriptionActions } from "../../../features/upsert-subscription/model/upsert-subscription.store.tsx";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { cn } from "../../../shared/ui/cn.ts";

export const SubscriptionList = memo(() => {
  const [namePrefix, setNamePrefix] = useState("");
  const changeNamePrefix: (value: string) => void = useCallback(
    (value) => setNamePrefix(value.toLowerCase()),
    [],
  );

  const subscriptions = useSubscriptions();
  const filteredSubscriptions = useMemo(
    () =>
      subscriptions.filter((subscription) =>
        subscription.name.toLowerCase().startsWith(namePrefix),
      ),
    [subscriptions, namePrefix],
  );
  const [activeSubscriptions, expiredSubscriptions] = useMemo(
    () =>
      filteredSubscriptions.reduce<
        [Array<SubscriptionModel>, Array<SubscriptionModel>]
      >(
        (prev, curr) => {
          const [active, expired] = prev;

          isSubscriptionExpired(curr) ? expired.push(curr) : active.push(curr);

          return prev;
        },
        [[], []],
      ),
    [filteredSubscriptions],
  );

  const { open } = useUpsertSubscriptionActions();

  const openSubscriptionUpdate = useCallback(
    (subscription: SubscriptionModel) => open(subscription),
    [open],
  );

  const subscriptionGridChildren = useCallback(
    ({ subscription }: SubscriptionGridChildrenProps) => (
      <SubscriptionGridItem
        key={subscription.id}
        subscription={subscription}
        onClick={openSubscriptionUpdate}
        hideNextPaymentAt={true}
      />
    ),
    [openSubscriptionUpdate],
  );

  return (
    <div className={cn("flex flex-col gap-4")}>
      <TextInput
        className={cn("self-start")}
        aria-label="Name prefix"
        placeholder="Name prefix"
        autoComplete="off"
        value={namePrefix}
        onChange={({ currentTarget }) => changeNamePrefix(currentTarget.value)}
        rightSection={
          namePrefix ? (
            <CloseButton
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => changeNamePrefix("")}
              aria-label="Clear name prefix"
            />
          ) : null
        }
      />

      {filteredSubscriptions.length > 0 ? (
        <>
          <SubscriptionGrid
            subscriptions={activeSubscriptions}
            noSubscriptionsPlaceholder={"No Active Subscriptions"}
          >
            {subscriptionGridChildren}
          </SubscriptionGrid>

          <Divider />

          <SubscriptionGrid
            subscriptions={expiredSubscriptions}
            noSubscriptionsPlaceholder={"No Expired Subscriptions"}
          >
            {subscriptionGridChildren}
          </SubscriptionGrid>
        </>
      ) : (
        <div>No Subscriptions</div>
      )}
    </div>
  );
});
