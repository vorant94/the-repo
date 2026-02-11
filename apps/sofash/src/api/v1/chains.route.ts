import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { chainNameSchema } from "../../bl/quickbook/name-to-external-id-mappings.ts";
import { insertChain, selectChains } from "../../dal/db/chains.table.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { chainSchema, insertChainSchema } from "../../shared/schema/chains.ts";
import { ensureRootMiddleware } from "./ensure-root.middleware.ts";

export const chainsRoute = new Hono();

chainsRoute.use(ensureRootMiddleware);

const chainDtoSchema = chainSchema
  .omit({
    resourceType: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi({ ref: "ChainDto" });

const insertChainDtoSchema = insertChainSchema
  .omit({ name: true })
  .extend({ name: chainNameSchema })
  .openapi({
    ref: "InsertChainDto",
  });

chainsRoute.get(
  "/",
  describeRoute({
    description: "List all chains",
    tags: ["chains"],
    security: [{ basicAuth: [] }],
    responses: {
      200: {
        description: "List of chains",
        content: {
          "application/json": {
            schema: resolver(z.array(chainDtoSchema)),
          },
        },
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  async (hc) => {
    try {
      const chains = await selectChains();
      const dtosResult = z.array(chainDtoSchema).safeParse(chains);
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

chainsRoute.post(
  "/insert",
  describeRoute({
    description: "Insert chain",
    tags: ["chains"],
    security: [{ basicAuth: [] }],
    responses: {
      201: {
        description: "Chain was inserted",
        content: {
          "application/json": {
            schema: resolver(chainDtoSchema),
          },
        },
      },
      400: {
        description: "Bad Request",
      },
      401: {
        description: "Unauthorized",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  validator("json", insertChainDtoSchema),
  async (hc) => {
    try {
      const chain = await insertChain(hc.req.valid("json"));
      const dtoResult = chainDtoSchema.safeParse(chain);
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
