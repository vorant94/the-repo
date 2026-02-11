import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { selectUsers, setUserRole } from "../../dal/db/users.table.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { userSchema } from "../../shared/schema/users.ts";
import { ensureRootMiddleware } from "./ensure-root.middleware.ts";

export const usersRoute = new Hono();

usersRoute.use(ensureRootMiddleware);

const userDtoSchema = userSchema
  .omit({
    resourceType: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi({ ref: "UserDto" });

usersRoute.get(
  "/",
  describeRoute({
    description: "List all users",
    tags: ["users"],
    security: [{ basicAuth: [] }],
    responses: {
      200: {
        description: "List of users",
        content: {
          "application/json": {
            schema: resolver(z.array(userDtoSchema)),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  async (hc) => {
    try {
      const users = await selectUsers();
      // can't use validateResponse of hono-openapi/zod#describeRoute since it doesn't
      // trim unknown to response schema fields like createdAt or resourceType
      const dtosResult = z.array(userDtoSchema).safeParse(users);
      if (!dtosResult.success) {
        return hc.text("Failed to parse response to DTO", 500);
      }
      return hc.json(dtosResult.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return hc.text(message, 500);
    }
  },
);

usersRoute.post(
  "/:id/promote-to-admin",
  describeRoute({
    description: "Promote a user to admin",
    tags: ["users"],
    security: [{ basicAuth: [] }],
    responses: {
      200: {
        description: "User was promoted to admin",
        content: {
          "application/json": {
            schema: resolver(userDtoSchema),
          },
        },
      },
      400: {
        description: "Bad Request",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "User not found",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  validator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (hc) => {
    try {
      const user = await setUserRole(hc.req.param("id"), "admin");
      const dtoResult = userDtoSchema.safeParse(user);
      if (!dtoResult.success) {
        return hc.text("Failed to parse response to DTO", 500);
      }
      return hc.json(dtoResult.data, 201);
    } catch (error) {
      if (error instanceof BadInputException) {
        return hc.text(error.message, 400);
      }
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return hc.text(message, 500);
    }
  },
);
