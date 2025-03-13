import path from "node:path";
import process from "node:process";
import { expect, test } from "@playwright/test";
import fse from "fs-extra";
import {
  monthlySubscription,
  yearlySubscription,
} from "../src/shared/api/__mocks__/subscription.model.ts";
import { recoverySchema } from "../src/shared/api/recovery.model.ts";
import type { SubscriptionModel } from "../src/shared/api/subscription.model.ts";
import { RecoveryPom } from "./poms/recovery.pom.ts";
import { populateDb } from "./utils/populate-db.ts";

test.describe("recovery", () => {
  test("should export all subscriptions as a JSON file", async ({ page }) => {
    const pom = new RecoveryPom(page);
    const subscriptionsToExport = [
      monthlySubscription,
      yearlySubscription,
    ] satisfies ReadonlyArray<SubscriptionModel>;

    await pom.goto();
    await pom.exportTab.click();
    await populateDb(page, subscriptionsToExport);

    await pom.export.selectAllSubscriptions.fill(true);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      pom.export.exportButton.click(),
    ]);
    const exportedRecoveryRaw = await fse.readJSON(await download.path());
    const exportedRecovery = recoverySchema.parse(exportedRecoveryRaw);

    const areAllSubscriptionsExported = subscriptionsToExport.every(
      (subscriptionToExport) =>
        !!exportedRecovery.subscriptions.find(
          (exportedSubscription) =>
            exportedSubscription.name === subscriptionToExport.name,
        ),
    );
    expect(areAllSubscriptionsExported).toBeTruthy();
  });

  test("should import all subscriptions from a JSON file", async ({ page }) => {
    const pom = new RecoveryPom(page);
    const filePathToImport = path.join(
      process.cwd(),
      "e2e/assets/subscriptions.json",
    );
    const recoveryToImportRaw = await fse.readJSON(filePathToImport);
    const recoveryToImport = recoverySchema.parse(recoveryToImportRaw);

    await pom.goto();
    await pom.importTab.click();
    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      pom.import.chooseFileButton.click(),
    ]);
    await fileChooser.setFiles(filePathToImport);
    await pom.import.submitButton.click();
    await pom.import.submitButton.click();
    const importedSubscriptions = await page.evaluate(
      async () => await window.db.subscriptions.toArray(),
    );

    // TODO validate categories as well
    const areAllSubscriptionsImported = recoveryToImport.subscriptions.every(
      (subscriptionToImport) =>
        !!importedSubscriptions.find(
          (importedSubscription) =>
            importedSubscription.name === subscriptionToImport.name,
        ),
    );
    expect(areAllSubscriptionsImported).toBeTruthy();
  });
});
