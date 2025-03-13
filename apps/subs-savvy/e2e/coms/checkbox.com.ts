import type { Locator } from "@playwright/test";

export class CheckboxCom {
  readonly #locator: Locator;

  constructor(locator: Locator) {
    this.#locator = locator;
  }

  async fill(value: boolean): Promise<void> {
    value ? await this.#locator.check() : await this.#locator.uncheck();
  }
}
