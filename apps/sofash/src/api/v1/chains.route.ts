import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { ntParseWithZod } from "nt";
import { z } from "zod";
import { chainNameSchema } from "../../bl/scrapper/name-to-external-id-mappings.ts";
import { insertChain, selectChains } from "../../dal/db/chains.table.ts";
import { BadInputException } from "../../shared/exceptions/bad-input.exception.ts";
import { BadOutputException } from "../../shared/exceptions/bad-output.exception.ts";
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
    const chains = await selectChains();

    const dtos = chains.andThen((chains) =>
      ntParseWithZod(chains, z.array(chainDtoSchema)).mapErr(
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
    const chain = await insertChain(hc.req.valid("json"));

    const dto = chain.andThen((inserted) =>
      ntParseWithZod(inserted, chainDtoSchema).mapErr(
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
