#!/usr/bin/env -S node --experimental-strip-types

import { resolve } from "node:path";
import { config } from "dotenv";
import { sign } from "hono/jwt";
import { z } from "zod";

const tokenLifetimeSeconds = 60 * 60;
const envSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: Environment variables use SCREAMING_SNAKE_CASE.
  JWT_SECRET: z.string(),
});

config({ path: resolve(import.meta.dirname, "../.dev.vars"), quiet: true });

const env = envSchema.parse(process.env);

const issuedAt = Math.floor(Date.now() / 1000);
const token = await sign(
  { exp: issuedAt + tokenLifetimeSeconds, iat: issuedAt },
  env.JWT_SECRET,
  "HS256",
);

console.info(token);
