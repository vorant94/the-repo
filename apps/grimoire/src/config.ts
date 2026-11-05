import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import process from "node:process";
import { createInterface, type Interface } from "node:readline/promises";
import { z } from "zod";
import { type Config, configSchema } from "./schemas/config.ts";

const configObjectSchema = z.record(z.string(), z.unknown());

export async function loadConfig(path: string): Promise<Config> {
  const input = await readConfig(path);
  const result = configSchema.safeParse(input);
  if (result.success) {
    return result.data;
  }

  const prompt = createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  const controller = new AbortController();
  prompt.once("close", () => controller.abort());
  try {
    const config = await promptConfig(
      configSchema,
      input,
      [],
      prompt,
      controller.signal,
    );
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(config, null, 2)}\n`);
  } finally {
    prompt.close();
  }

  return loadConfig(path);
}

async function readConfig(path: string): Promise<unknown> {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in ${path}: ${error.message}`);
      return {};
    }
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function promptConfig(
  schema: z.ZodType,
  value: unknown,
  path: Array<string>,
  prompt: Interface,
  signal: AbortSignal,
): Promise<unknown> {
  if (schema instanceof z.ZodObject) {
    const result = configObjectSchema.safeParse(value);
    const config = result.success ? result.data : {};
    for (const [key, fieldSchema] of Object.entries(schema.shape)) {
      config[key] = await promptConfig(
        fieldSchema,
        config[key],
        [...path, key],
        prompt,
        signal,
      );
    }
    return config;
  }

  let answer = value;
  let result = schema.safeParse(answer);
  while (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message).join("; ");
    answer = await prompt.question(`${path.join(".")} (${errors}): `, {
      signal,
    });
    result = schema.safeParse(answer);
  }
  return answer;
}
