import { promoteUserToAdmin } from "@/bl/system/promote-user-to-admin.ts";
import { userSchema } from "@/shared/schema/users.ts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { z } from "zod";

export const usersRoute = new Hono();

const userDtoSchema = userSchema.omit({
  resourceType: true,
  createdAt: true,
  updatedAt: true,
});

usersRoute.put(
  "/:id/promote-to-admin",
  describeRoute({
    description: "Promote a user to admin",
    security: [
      {
        basicAuth: [],
      },
    ],
    responses: {
      200: {
        description: "User promoted to admin",
        content: {
          "application/json": {
            schema: resolver(userDtoSchema),
          },
        },
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
