import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";
import { ensureRoot } from "../../bl/auth/ensure-root.ts";
import { findAllUsers, promoteUserToAdmin } from "../../bl/users.ts";
import { userSchema } from "../../shared/schema/users.ts";

export const usersRoute = new Hono();

usersRoute.use(ensureRoot);

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
    const users = await findAllUsers();

    return hc.json(users.map((user) => userDtoSchema.parse(user)));
  },
);

usersRoute.put(
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
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  zValidator(
    "param",
    z.object({
      id: z.string(),
    }),
  ),
  async (hc) => {
    const user = await promoteUserToAdmin(hc.req.param("id"));

    return hc.json(userDtoSchema.parse(user));
  },
);
