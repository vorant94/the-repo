import { type FC, memo } from "react";
import { useUpsertSubscriptionMode } from "../../../features/upsert-subscription/model/upsert-subscription.store.tsx";
import { AddSubscriptionButton } from "../../../features/upsert-subscription/ui/add-subscription-button.tsx";
import { UpsertSubscription } from "../../../features/upsert-subscription/ui/upsert-subscription.tsx";
import { cn } from "../../../shared/ui/cn.ts";
import {
  DefaultLayout,
  DefaultLayoutHeader,
} from "../../../shared/ui/default.layout.tsx";
import { ExpensesByCategory } from "../../../widgets/expenses-by-category/ui/expenses-by-category.tsx";
import { ExpensesPerMonth } from "../../../widgets/expenses-per-month/ui/expenses-per-month.tsx";
import { ManageCategories } from "../../../widgets/manage-categories/ui/manage-categories.tsx";
import { SelectCategory } from "../../../widgets/select-category/ui/select-category.tsx";
import { UpcomingPayments } from "../../../widgets/upcoming-payments/ui/upcoming-payments.tsx";

export const DashboardPage: FC = memo(() => {
  const mode = useUpsertSubscriptionMode();

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
      drawerTitle={`${mode === "update" ? "Update" : "Insert"} Subscription`}
    >
      <div className={cn("flex flex-col gap-8")}>
        <ExpensesPerMonth />

        <UpcomingPayments />

        <ExpensesByCategory />
      </div>
    </DefaultLayout>
  );
});
