import { join } from "node:path";
import { isCancel, password } from "@clack/prompts";
import fs from "fs-extra";
import z from "zod";
import { paths } from "../../shared/paths.ts";

const configPath = join(paths.config, "config.json");

const configSchema = z.object({
  googleApiKey: z.string().optional(),
});

type Config = z.infer<typeof configSchema>;

async function readConfig(): Promise<Config> {
  try {
    const content = await fs.readJSON(configPath);
    return configSchema.parse(content);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return {};
    }
    throw error;
  }
}

async function writeConfig(config: Config): Promise<void> {
  await fs.ensureDir(paths.config);
  await fs.writeJSON(configPath, config, { spaces: 2 });
}

export async function getOrPromptLlmApiKey(): Promise<string> {
  const config = await readConfig();

  if (config.googleApiKey) {
    return config.googleApiKey;
  }

  const key = await password({
    message: "Enter your Google API key:",
    mask: "*",
  });

  if (isCancel(key)) {
    throw new Error("You need to provide API key in order to continue");
  }

  await writeConfig({ ...config, googleApiKey: key });

  return key;
}
