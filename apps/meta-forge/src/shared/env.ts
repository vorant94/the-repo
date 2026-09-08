import { z } from "zod";

export const envSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: Cloudflare secret binding name
  JWT_SECRET: z.string().min(1),
  // biome-ignore lint/style/useNamingConvention: Cloudflare secret binding name
  R2_ACCESS_KEY_ID: z.string().min(1),
  // biome-ignore lint/style/useNamingConvention: Cloudflare secret binding name
  R2_ACCOUNT_ID: z.string().min(1),
  // biome-ignore lint/style/useNamingConvention: Cloudflare secret binding name
  R2_SECRET_ACCESS_KEY: z.string().min(1),
});
export type Env = z.infer<typeof envSchema>;
