import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { categoryMock } from "../src/shared/api/__mocks__/category.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "../src/shared/api/__mocks__/subscription.model.ts";
import type {
  InsertSubscriptionModel,
  SubscriptionModel,
  UpdateSubscriptionModel,
} from "../src/shared/api/subscription.model.ts";
import { SubscriptionsPom } from "./poms/subscriptions.pom.ts";
import { populateDb } from "./utils/populate-db.ts";

test.describe("subscriptions", () => {
  test("should have no subscriptions initially", async ({ page }) => {
    const pom = new SubscriptionsPom(page);

    await pom.goto();

    await pom.selectCategory.manageButton.click();

    await expect(pom.noSubscriptionsPlaceholder).toBeVisible();
  });

  test("should find existing subscriptions", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const subscriptions = [
      monthlySubscription,
      yearlySubscription,
    ] satisfies ReadonlyArray<SubscriptionModel>;

    await pom.goto();
    await populateDb(page, subscriptions);

    for (const subscription of subscriptions) {
      await expect(pom.subscriptionListItem(subscription)).toBeVisible();
    }
  });

  test("should filter subscriptions on name prefix", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const subscriptions = [
      monthlySubscription,
      yearlySubscription,
    ] satisfies ReadonlyArray<SubscriptionModel>;

    await pom.goto();
    await populateDb(page, subscriptions);

    await pom.namePrefixControl.fill("te");

    await expect(
      pom.subscriptionListItem(monthlySubscription),
    ).not.toBeVisible();
    await expect(pom.subscriptionListItem(yearlySubscription)).toBeVisible();

    await pom.clearNamePrefixButton.click();
    for (const subscription of subscriptions) {
      await expect(pom.subscriptionListItem(subscription)).toBeVisible();
    }
  });

  test("should insert subscription", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const subscriptionToCreate = {
      ...monthlySubscription,
      description: "Basic Plan",
      endedAt: dayjs(monthlySubscription.startedAt).add(1, "year").toDate(),
    } as const satisfies InsertSubscriptionModel;

    await pom.goto();
    await populateDb(page, [], [categoryMock]);

    await pom.addSubscriptionButton.click();
    await pom.upsertSubscription.fill(subscriptionToCreate);
    await pom.upsertSubscription.insertButton.click();

    await expect(pom.subscriptionListItem(subscriptionToCreate)).toBeVisible();
  });

  test("should update subscription", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const subscriptionToUpdate = {
      ...monthlySubscription,
    } as const satisfies SubscriptionModel;
    const updatedSubscription = {
      ...monthlySubscription,
      name: "YouTube",
    } as const satisfies UpdateSubscriptionModel;

    await pom.goto();
    await populateDb(page, [subscriptionToUpdate]);

    await pom.subscriptionListItem(subscriptionToUpdate).click();
    await pom.upsertSubscription.fill(updatedSubscription);
    await pom.upsertSubscription.updateButton.click();

    await expect(
      pom.subscriptionListItem(subscriptionToUpdate),
    ).not.toBeVisible();
    await expect(pom.subscriptionListItem(updatedSubscription)).toBeVisible();
  });

  test("should delete subscription", async ({ page }) => {
    const pom = new SubscriptionsPom(page);
    const subscriptionToDelete = {
      ...monthlySubscription,
    } as const satisfies SubscriptionModel;

    await pom.goto();
    await populateDb(page, [subscriptionToDelete]);

    await pom.subscriptionListItem(subscriptionToDelete).click();
    await pom.upsertSubscription.deleteButton.click();

    await expect(
      pom.subscriptionListItem(subscriptionToDelete),
    ).not.toBeVisible();
  });
});
