import Dexie, { type EntityTable } from "dexie";
import type { CategoryModel } from "../api/category.model.ts";
import type { SubscriptionModel } from "../api/subscription.model.ts";
// import { t } from "i18next"

export const dbVersion = 5;

export const db = new Dexie("subs-savvy") as Db;

export interface Db extends Dexie {
  subscriptions: EntityTable<RawSubscriptionModel, "id">;
  categories: EntityTable<CategoryModel, "id">;
}

db.version(dbVersion).stores({
  subscriptions: "++id,price,categoryId",
  categories: "++id",
});

db.on("populate", (_) => {
  // populate with preconfigured categories here, t from i18next is already available
  // console.log(t("dashboard"));
});

export interface RawSubscriptionModel
  extends Omit<SubscriptionModel, "category"> {
  categoryId?: CategoryModel["id"] | null;
}
