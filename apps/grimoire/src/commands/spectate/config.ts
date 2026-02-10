import { password } from "@inquirer/prompts";
import Configstore from "configstore";
import z from "zod";

const config = new Configstore("grimoire");

export async function getOrPromptLlmApiKey(): Promise<string> {
  const rawExistingKey = config.get("googleApiKey");

  if (rawExistingKey) {
    return z.string().parse(rawExistingKey);
  }

  const key = await password({
    message: "Enter your Google API key:",
    mask: "*",
  });
  config.set("googleApiKey", key);
  return key;
}
