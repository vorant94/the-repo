import { TextDecoder } from "node:util";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { rootUserChatId, upsertUser } from "../../dal/db/users.table.ts";
import {
  getContext,
  runWithinPatchedContext,
} from "../../shared/context/context.ts";
import type { HonoEnv } from "../../shared/env/hono-env.ts";
import { createLogger } from "../../shared/logger/logger.ts";

// reimplementing basic auth as a hack to set user to context once he is
// authenticated. cannot work around by reimplementing only verifyUser as i did
// previously because patching context with enterWith doesn't work in
// Cloudflare Workers. Source of most of the code:
//  - https://github.com/honojs/hono/blob/main/src/middleware/basic-auth/index.ts
//  - https://github.com/honojs/hono/blob/main/src/utils/basic-auth.ts
//  - https://github.com/honojs/hono/blob/main/src/utils/encode.ts
export const ensureRoot: MiddlewareHandler<HonoEnv> = async (hc, next) => {
  using logger = createLogger("ensureRoot");

  const requestUser = auth(hc.req.raw);
  if (requestUser) {
    const { config } = getContext();

    const isEqual =
      requestUser.username === config.ROOT_USERNAME &&
      requestUser.password === config.ROOT_PASSWORD;
    if (isEqual) {
      const user = await upsertUser({
        telegramChatId: rootUserChatId,
        role: "root",
      });

      return runWithinPatchedContext({ user }, () => {
        logger.info("context is authenticated, user id is", user.id);
        return next();
      });
    }
  }

  const status = 401;
  const res = new Response("Unauthorized", {
    status,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
  throw new HTTPException(status, { res });
};

const CREDENTIALS_REGEXP =
  /^ *[Bb][Aa][Ss][Ii][Cc] +([A-Za-z0-9._~+\/-]+=*) *$/;
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;
const utf8Decoder = new TextDecoder();

type Auth = (
  req: Request,
) => { username: string; password: string } | undefined;

const auth: Auth = (req) => {
  const match = CREDENTIALS_REGEXP.exec(req.headers.get("Authorization") || "");
  if (!match) {
    return undefined;
  }

  let userPass = undefined;
  // If an invalid string is passed to atob(), it throws a `DOMException`.
  try {
    userPass = USER_PASS_REGEXP.exec(
      // biome-ignore lint/style/noNonNullAssertion: copy-paste code from trusted source
      utf8Decoder.decode(decodeBase64(match[1]!)),
    );
  } catch {} // Do nothing

  if (!userPass) {
    return undefined;
  }

  // biome-ignore lint/style/noNonNullAssertion: copy-paste code from trusted source
  return { username: userPass[1]!, password: userPass[2]! };
};

const decodeBase64 = (str: string): Uint8Array => {
  const binary = atob(str);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  const half = binary.length / 2;
  for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
    bytes[i] = binary.charCodeAt(i);
    bytes[j] = binary.charCodeAt(j);
  }
  return bytes;
};
