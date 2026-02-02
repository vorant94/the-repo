import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface TempDir {
  path: string;
  cleanup: () => Promise<void>;
}

export async function createTempDir(prefix: string): Promise<TempDir> {
  const path = await mkdtemp(join(tmpdir(), `grimoire-e2e-${prefix}-`));

  return {
    path,
    cleanup: async () => {
      await rm(path, { recursive: true, force: true });
    },
  };
}
