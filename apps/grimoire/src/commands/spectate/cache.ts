import { join } from "node:path";
import fs from "fs-extra";
import { ZodError, z } from "zod";
import { paths } from "../../shared/paths.ts";

const cacheDir = join(paths.cache, "spectate");

const cachedAnalysisSchema = z.object({
  analysis: z.string(),
  model: z.string(),
});

export type CachedAnalysis = z.infer<typeof cachedAnalysisSchema>;

export async function getCachedAnalysis(
  videoId: string,
): Promise<CachedAnalysis | null> {
  const cachePath = join(cacheDir, `${videoId}.json`);

  try {
    const content = await fs.readJSON(cachePath);
    return cachedAnalysisSchema.parse(content);
  } catch (error) {
    if (error instanceof ZodError) {
      return null;
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

export async function setCachedAnalysis(
  videoId: string,
  model: string,
  analysis: string,
): Promise<void> {
  await fs.ensureDir(cacheDir);

  const cachePath = join(cacheDir, `${videoId}.json`);
  const data: CachedAnalysis = {
    analysis,
    model,
  };

  await fs.writeJSON(cachePath, data, { spaces: 2 });
}
