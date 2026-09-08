import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute } from "hono-openapi";
import { getAppContext } from "../shared/app-context.ts";
import type { HonoEnv } from "../shared/hono-env.ts";

export const bucketRoute = new Hono<HonoEnv>();

bucketRoute.get(
  "/:objectKey{.+}",
  describeRoute({
    description: "Get an object from the local R2 bucket",
    tags: ["bucket"],
    security: [],
    parameters: [
      {
        name: "objectKey",
        in: "path",
        required: true,
        description: "Slash-separated R2 object key",
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "Bucket object",
        content: {
          "application/octet-stream": {
            schema: { type: "string", format: "binary" },
          },
        },
      },
      404: { description: "Object not found" },
    },
  }),
  async (c) => {
    const { bucket } = getAppContext();
    const objectKey = c.req.param("objectKey");
    const object = await bucket.get(objectKey);
    if (!object) {
      throw new HTTPException(404, { message: "Object was not found" });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new Response(object.body, { headers });
  },
);
