import type { Locator, Page } from "@playwright/test";
import { CheckboxCom } from "./checkbox.com.ts";

export class ExportRecoveryCom {
  readonly exportButton: Locator;
  readonly selectAllSubscriptions: CheckboxCom;

  constructor(page: Page) {
    this.exportButton = page.getByRole("button", { name: "export" });

    this.selectAllSubscriptions = new CheckboxCom(
      page.getByLabel("select all subscriptions"),
    );
  }
}
