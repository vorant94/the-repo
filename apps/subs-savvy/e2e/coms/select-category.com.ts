import type { Locator, Page } from "@playwright/test";
import type {
  CategoryModel,
  UpsertCategoryModel,
} from "../../src/shared/api/category.model.ts";
import { CategoryFormCom } from "./category-form.com.ts";

export class SelectCategoryCom {
  readonly manageButton: Locator;
  readonly addButton: Locator;
  readonly insertButton: Locator;
  readonly updateButton: Locator;
  readonly noCategoriesPlaceholder: Locator;

  readonly form: CategoryFormCom;

  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;

    this.manageButton = this.#page.getByRole("button", { name: "manage" });
    this.addButton = this.#page.getByRole("button", { name: "add category" });
    this.insertButton = this.#page.getByRole("button", { name: "insert" });
    this.updateButton = this.#page.getByRole("button", { name: "update" });
    this.noCategoriesPlaceholder = this.#page.getByText("No Categories");

    this.form = new CategoryFormCom(this.#page);
  }

  category({ name }: CategoryModel | UpsertCategoryModel): Locator {
    return this.#page.getByRole("paragraph").filter({ hasText: name });
  }

  editButton({ name }: CategoryModel | UpsertCategoryModel): Locator {
    return this.#page.getByRole("button", { name: `edit ${name} category` });
  }

  deleteButton({ name }: CategoryModel | UpsertCategoryModel): Locator {
    return this.#page.getByRole("button", { name: `delete ${name} category` });
  }
}
