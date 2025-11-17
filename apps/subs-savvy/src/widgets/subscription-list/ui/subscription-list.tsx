import { CloseButton, Divider, TextInput } from "@mantine/core";
import { cn } from "cn";
import { type FC, useState } from "react";
import { isSubscriptionExpired } from "../../../entities/subscription/lib/is-subscription-expired.ts";
import {
  SubscriptionGrid,
  type SubscriptionGridChildrenProps,
} from "../../../features/list-subscriptions/ui/subscription-grid.tsx";
import { SubscriptionGridItem } from "../../../features/list-subscriptions/ui/subscription-grid-item.tsx";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { useStore, useSubscriptions } from "../../../shared/store/hooks.ts";

export const SubscriptionList = () => {
  const [namePrefix, setNamePrefix] = useState("");
  const changeNamePrefix: (value: string) => void = (value) =>
    setNamePrefix(value.toLowerCase());

  const subscriptions = useSubscriptions();
  const filteredSubscriptions = subscriptions.filter((subscription) =>
    subscription.name.toLowerCase().startsWith(namePrefix),
  );
  const [activeSubscriptions, expiredSubscriptions] =
    filteredSubscriptions.reduce<
      [Array<SubscriptionModel>, Array<SubscriptionModel>]
    >(
      (prev, curr) => {
        const [active, expired] = prev;

        isSubscriptionExpired(curr) ? expired.push(curr) : active.push(curr);

        return prev;
      },
      [[], []],
    );

  const openSubscriptionUpdate = (subscription: SubscriptionModel) =>
    useStore.getState().openUpsertSubscription(subscription);

  const SubscriptionGridChildren: FC<SubscriptionGridChildrenProps> = ({
    subscription,
  }) => (
    <SubscriptionGridItem
      key={subscription.id}
      subscription={subscription}
      onClick={openSubscriptionUpdate}
      hideNextPaymentAt={true}
    />
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
            // biome-ignore lint/correctness/noChildrenProp: component isn't executed here, but passed to be executed inside, so its more clear to pass it like that
            children={SubscriptionGridChildren}
          />

          <Divider />

          <SubscriptionGrid
            subscriptions={expiredSubscriptions}
            noSubscriptionsPlaceholder={"No Expired Subscriptions"}
            // biome-ignore lint/correctness/noChildrenProp: component isn't executed here, but passed to be executed inside, so its more clear to pass it like that
            children={SubscriptionGridChildren}
          />
        </>
      ) : (
        <div>No Subscriptions</div>
      )}
    </div>
  );
};
