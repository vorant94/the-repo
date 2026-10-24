import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1)
    .describe("Page number, starting at 1"),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(50)
    .describe("Number of items per page, up to 100"),
});
