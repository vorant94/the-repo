import type { CategoryModel } from "../category.model.ts";

export const categoryMock = {
  id: 5,
  name: "Basics",
  color: "#000000",
} as const satisfies CategoryModel;
