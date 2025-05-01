import { cn } from "cn";
import { type FC, memo } from "react";
import { AddSubscriptionButton } from "../../../features/upsert-subscription/ui/add-subscription-button.tsx";
import { UpsertSubscription } from "../../../features/upsert-subscription/ui/upsert-subscription.tsx";
import { useUpsertSubscription } from "../../../shared/store/hooks.ts";
import {
  DefaultLayout,
  DefaultLayoutHeader,
} from "../../../shared/ui/default.layout.tsx";
import { ManageCategories } from "../../../widgets/manage-categories/ui/manage-categories.tsx";
import { SelectCategory } from "../../../widgets/select-category/ui/select-category.tsx";
import { SubscriptionList } from "../../../widgets/subscription-list/ui/subscription-list.tsx";

export const SubscriptionsPage: FC = memo(() => {
  const { upsertSubscriptionMode } = useUpsertSubscription();

  return (
    <DefaultLayout
      header={
        <DefaultLayoutHeader actions={<AddSubscriptionButton />}>
          <div className={cn("flex items-center gap-2")}>
            <SelectCategory />
            <ManageCategories />
          </div>
        </DefaultLayoutHeader>
      }
      drawerContent={<UpsertSubscription />}
      drawerTitle={`${upsertSubscriptionMode === "update" ? "Update" : "Insert"} Subscription`}
    >
      <SubscriptionList />
    </DefaultLayout>
  );
});
