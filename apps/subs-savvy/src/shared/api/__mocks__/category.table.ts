import { vi } from "vitest";
import type { CategoryModel } from "../category.model.ts";
import { categoryMock } from "./category.model.ts";

export const findCategories = vi.fn(async () => [
  categoryMock,
]) satisfies () => Promise<ReadonlyArray<CategoryModel>>;
