import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import { selectUsers, setUserRole } from "../../dal/db/users.table.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
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
    const users = await selectUsers();

    const dtos = users.andThen((users) =>
      ntParseWithZod(users, z.array(userDtoSchema)).mapErr(
        (err) =>
          new BadOutputException("Failed to parse response to DTO", {
            cause: err,
          }),
      ),
    );

    return dtos.match(
      (value) => hc.json(value),
      (error) => hc.text(error.message, 500),
    );
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
    const user = await setUserRole(hc.req.param("id"), "admin");

    const dto = user.andThen((inserted) =>
      ntParseWithZod(inserted, userDtoSchema).mapErr(
        (err) =>
          new BadOutputException("Failed to parse response to DTO", {
            cause: err,
          }),
      ),
    );

    return dto.match(
      (value) => hc.json(value, 201),
      (error) => {
        let status: ContentfulStatusCode = 500;
        if (error instanceof BadInputException) {
          status = 400;
        }

        return hc.text(error.message, status);
      },
    );
  },
);
