import type { Page } from "@playwright/test";
import type { UpsertCategoryModel } from "../../src/shared/api/category.model.ts";
import { InputCom } from "./input.com.ts";

export class CategoryFormCom {
  readonly nameControl: InputCom;
  readonly colorControl: InputCom;

  constructor(page: Page) {
    this.nameControl = new InputCom(page.getByLabel("Name", { exact: true }));
    this.colorControl = new InputCom(page.getByLabel("color"));
  }

  async fill(category: UpsertCategoryModel): Promise<void> {
    await this.nameControl.fill(category.name);
    await this.colorControl.fill(category.color);
  }
}
