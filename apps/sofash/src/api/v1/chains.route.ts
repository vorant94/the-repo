import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import { ensureRoot } from "../../bl/auth/ensure-root.ts";
import { insertChain, selectChains } from "../../dal/db/chains.table.ts";
import { chainSchema, insertChainSchema } from "../../shared/schema/chains.ts";

export const chainsRoute = new Hono();

chainsRoute.use(ensureRoot);

const chainDtoSchema = chainSchema
  .omit({
    resourceType: true,
    createdAt: true,
    updatedAt: true,
  })
  .openapi({ ref: "ChainDto" });

const insertChainDtoSchema = insertChainSchema.openapi({
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
    },
  }),
  async (hc) => {
    const chains = await selectChains();

    const dtos = chains.andThen((selected) =>
      ntParseWithZod(selected, z.array(chainDtoSchema)).mapErr(
        (err) =>
          new HTTPException(500, {
            message: "Failed to parse response to DTO",
            cause: err,
          }),
      ),
    );
    if (dtos.isErr()) {
      throw dtos.error;
    }

    return hc.json(dtos.value);
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
      401: {
        description: "Unauthorized",
      },
      400: {
        description: "Bad Request",
      },
      409: {
        description: "Chain already exists",
      },
      500: {
        description: "Internal Server Error",
      },
    },
  }),
  validator("json", insertChainDtoSchema),
  async (hc) => {
    const chain = await insertChain(hc.req.valid("json"));

    const dto = chain.andThen((upserted) =>
      ntParseWithZod(upserted, chainDtoSchema).mapErr(
        (err) =>
          new HTTPException(500, {
            message: "Failed to parse response to DTO",
            cause: err,
          }),
      ),
    );
    if (dto.isErr()) {
      throw dto.error;
    }

    return hc.json(dto.value, 201);
  },
);
