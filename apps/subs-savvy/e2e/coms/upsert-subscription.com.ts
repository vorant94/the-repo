import type { Locator, Page } from "@playwright/test";
import {
  type SubscriptionCyclePeriodModel,
  subscriptionCyclePeriodToLabel,
} from "../../src/shared/api/subscription-cycle-period.model.ts";
import {
  type SubscriptionIconModel,
  subscriptionIconToLabel,
} from "../../src/shared/api/subscription-icon.model.ts";
import type { UpsertSubscriptionModel } from "../../src/shared/api/subscription.model.ts";
import { createDatePickerInputAriaLabels } from "../../src/shared/ui/create-date-picker-input-aria-labels.ts";
import { DatePickerInputCom } from "./date-picker-input.com.ts";
import { InputCom } from "./input.com.ts";
import { SelectCom } from "./select.com.ts";

export class UpsertSubscriptionCom {
  readonly insertButton: Locator;
  readonly updateButton: Locator;
  readonly deleteButton: Locator;

  readonly nameControl: InputCom;
  readonly descriptionControl: InputCom;
  readonly iconControl: SelectCom<SubscriptionIconModel>;
  readonly priceControl: InputCom;
  readonly startedAtControl: DatePickerInputCom;
  readonly endedAtControl: DatePickerInputCom;
  readonly eachControl: InputCom;
  readonly periodControl: SelectCom<SubscriptionCyclePeriodModel>;
  readonly categoryControl: SelectCom;

  constructor(page: Page) {
    this.insertButton = page.getByRole("button", { name: "insert" });
    this.updateButton = page.getByRole("button", { name: "update" });
    this.deleteButton = page.getByRole("button", { name: "delete" });

    this.nameControl = new InputCom(page.getByLabel("Name", { exact: true }));
    this.descriptionControl = new InputCom(page.getByLabel("description"));
    this.iconControl = new SelectCom(
      page.getByLabel("icon"),
      subscriptionIconToLabel,
    );
    this.priceControl = new InputCom(page.getByLabel("price"));
    this.startedAtControl = new DatePickerInputCom(
      page.getByLabel("started at"),
      DatePickerInputCom.mapAriaLabelsToLocators(
        page,
        createDatePickerInputAriaLabels("started at"),
      ),
      page,
    );
    this.endedAtControl = new DatePickerInputCom(
      page.getByLabel("ended at"),
      DatePickerInputCom.mapAriaLabelsToLocators(
        page,
        createDatePickerInputAriaLabels("ended at"),
      ),
      page,
    );
    this.eachControl = new InputCom(page.getByLabel("each"));
    this.periodControl = new SelectCom(
      page.getByLabel("period"),
      subscriptionCyclePeriodToLabel,
    );
    this.categoryControl = new SelectCom(
      page.getByLabel("Category", { exact: true }),
    );
  }

  async fill(subscription: UpsertSubscriptionModel): Promise<void> {
    await this.nameControl.fill(subscription.name);

    if (subscription.description) {
      await this.descriptionControl.fill(subscription.description);
    }

    await this.iconControl.fillWithValue(subscription.icon);
    await this.priceControl.fill(subscription.price);
    await this.startedAtControl.fill(subscription.startedAt);

    if (subscription.endedAt) {
      await this.endedAtControl.fill(subscription.endedAt);
    }

    await this.eachControl.fill(subscription.cycle.each);
    await this.periodControl.fillWithValue(subscription.cycle.period);

    if (subscription.category) {
      await this.categoryControl.fillWithLabel(subscription.category.name);
    }
  }
}
