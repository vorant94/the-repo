import type { Locator, Page } from "@playwright/test";
import type {
  SubscriptionModel,
  UpsertSubscriptionModel,
} from "../../src/shared/api/subscription.model.ts";
import { rootRoute } from "../../src/shared/lib/route.ts";
import { InputCom } from "../coms/input.com.ts";
import { SelectCategoryCom } from "../coms/select-category.com.ts";
import { UpsertSubscriptionCom } from "../coms/upsert-subscription.com.ts";

export class SubscriptionsPom {
  readonly addSubscriptionButton: Locator;
  readonly noSubscriptionsPlaceholder: Locator;
  readonly namePrefixControl: InputCom;
  readonly clearNamePrefixButton: Locator;

  readonly upsertSubscription: UpsertSubscriptionCom;

  readonly selectCategory: SelectCategoryCom;

  readonly subscriptionsNavLink: Locator;

  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;

    this.addSubscriptionButton = this.#page.getByRole("button", {
      name: "add sub",
    });
    this.noSubscriptionsPlaceholder = this.#page.getByText("No Subscriptions");
    this.namePrefixControl = new InputCom(this.#page.getByLabel("name prefix"));
    this.clearNamePrefixButton = this.#page.getByLabel("clear name prefix");

    this.upsertSubscription = new UpsertSubscriptionCom(this.#page);

    this.selectCategory = new SelectCategoryCom(this.#page);

    this.subscriptionsNavLink = this.#page.getByRole("link", {
      name: "subscriptions",
    });
  }

  async goto() {
    await this.#page.goto("/");
    await this.subscriptionsNavLink.click();
    await this.#page.waitForURL(`/${rootRoute.subscriptions}`);
  }

  subscriptionListItem({
    name,
  }: SubscriptionModel | UpsertSubscriptionModel): Locator {
    return this.#page.getByLabel(name);
  }
}
