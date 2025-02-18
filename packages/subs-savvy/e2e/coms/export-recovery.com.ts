import type { Locator, Page } from "@playwright/test";
import { CheckboxCom } from "./checkbox.com.ts";

export class ExportRecoveryCom {
  readonly exportButton: Locator;
  readonly selectAllSubscriptions: CheckboxCom;

  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;

    this.exportButton = this.#page.getByRole("button", { name: "export" });

    this.selectAllSubscriptions = new CheckboxCom(
      this.#page.getByLabel("select all subscriptions"),
    );
  }
}
