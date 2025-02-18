import type { Locator, Page } from "@playwright/test";
import { rootRoute } from "../../src/shared/lib/route.ts";
import { ExportRecoveryCom } from "../coms/export-recovery.com.ts";
import { ImportRecoveryCom } from "../coms/import-recovery.com.ts";

export class RecoveryPom {
  readonly recoveryNavLink: Locator;
  readonly export: ExportRecoveryCom;
  readonly import: ImportRecoveryCom;

  readonly exportTab: Locator;
  readonly importTab: Locator;

  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;

    this.recoveryNavLink = this.#page.getByRole("link", { name: "recovery" });

    this.export = new ExportRecoveryCom(this.#page);
    this.import = new ImportRecoveryCom(this.#page);

    this.exportTab = this.#page.getByRole("tab", { name: "export" });
    this.importTab = this.#page.getByRole("tab", { name: "import" });
  }

  async goto() {
    await this.#page.goto("/");
    await this.recoveryNavLink.click();
    await this.#page.waitForURL(`/${rootRoute.recovery}`);
  }
}
