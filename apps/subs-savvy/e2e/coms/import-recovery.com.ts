import type { Locator, Page } from "@playwright/test";

export class ImportRecoveryCom {
  readonly chooseFileButton: Locator;
  readonly submitButton: Locator;

  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;

    this.chooseFileButton = this.#page.getByLabel(
      "click or drag & drop to upload file",
    );
    this.submitButton = this.#page.getByRole("button", {
      name: "Submit",
      exact: true,
    });
  }
}
