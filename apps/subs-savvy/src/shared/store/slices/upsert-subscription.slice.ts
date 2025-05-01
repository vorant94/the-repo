import {} from "zod";
import type {} from "../../api/category.model.ts";
import {} from "../../api/category.table.ts";
import type {
  InsertSubscriptionModel,
  UpdateSubscriptionModel,
} from "../../api/subscription.model.ts";
import {
  deleteSubscription,
  insertSubscription,
  updateSubscription,
} from "../../api/subscription.table.ts";
import type {
  StateCreator,
  UpsertSubscriptionActions,
  UpsertSubscriptionState,
} from "../types.ts";

export const createUpsertSubscriptionSlice: StateCreator<
  UpsertSubscriptionState & UpsertSubscriptionActions
> = (set, get) => ({
  upsertSubscriptionMode: null,
  subscriptionToUpsert: null,
  openUpsertSubscription(subscription) {
    return set(
      subscription
        ? {
            subscriptionToUpsert: subscription,
            upsertSubscriptionMode: "update",
          }
        : {
            subscriptionToUpsert: null,
            upsertSubscriptionMode: "insert",
          },
      undefined,
      { type: "open", subscription },
    );
  },
  closeUpsertSubscription() {
    return set(
      {
        upsertSubscriptionMode: null,
        subscriptionToUpsert: null,
      },
      undefined,
      { type: "close" },
    );
  },
  async upsertSubscription(raw) {
    const store = get();

    store.upsertSubscriptionMode === "update"
      ? await updateSubscription(raw as UpdateSubscriptionModel)
      : await insertSubscription(raw as InsertSubscriptionModel);

    store.closeUpsertSubscription();
    set({}, undefined, { type: "upsert", raw });
  },
  async deleteSubscription() {
    const store = get();
    if (store.upsertSubscriptionMode !== "update") {
      throw new Error("Nothing to delete in insert mode!");
    }

    await deleteSubscription(store.subscriptionToUpsert.id);

    store.closeUpsertSubscription();
    set({}, undefined, { type: "delete" });
  },
});
