import type { Locator } from "@playwright/test";

export class InputCom {
  readonly #locator: Locator;

  constructor(locator: Locator) {
    this.#locator = locator;
  }

  async fill(value: string | number): Promise<void> {
    await this.#locator.fill(`${value}`);
  }
}
