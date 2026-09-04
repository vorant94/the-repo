import { z } from "zod";

export const envSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: Cloudflare secret binding name
  JWT_SECRET: z.string().min(1),
});
export type Env = z.infer<typeof envSchema>;
