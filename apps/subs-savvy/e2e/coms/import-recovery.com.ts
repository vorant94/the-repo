import type { Locator, Page } from "@playwright/test";

export class ImportRecoveryCom {
  readonly chooseFileButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.chooseFileButton = page.getByLabel(
      "click or drag & drop to upload file",
    );
    this.submitButton = page.getByRole("button", {
      name: "Submit",
      exact: true,
    });
  }
}
