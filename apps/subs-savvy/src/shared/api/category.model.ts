import { z } from "zod";

export const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  color: z.string(),
});
export type CategoryModel = z.infer<typeof categorySchema>;

export const insertCategorySchema = categorySchema.omit({ id: true });
export type InsertCategoryModel = z.infer<typeof insertCategorySchema>;

export const updateCategorySchema = categorySchema.omit({});
export type UpdateCategoryModel = z.infer<typeof updateCategorySchema>;

export type UpsertCategoryModel = InsertCategoryModel | UpdateCategoryModel;
