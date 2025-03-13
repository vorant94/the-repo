import fse from "fs-extra";
import { sortObjectKeys } from "../src/shared/lib/sort-object-keys.ts";
import { translationFilePaths } from "./shared/translation.ts";

await Promise.all(
  translationFilePaths.map(async (filePath) => {
    const translation = await fse.readJSON(filePath);

    const sortedTranslation = sortObjectKeys(translation);

    await fse.writeJSON(filePath, sortedTranslation, {
      spaces: 2,
    });
  }),
);
