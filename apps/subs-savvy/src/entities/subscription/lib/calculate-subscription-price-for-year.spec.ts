import { addYears, setMonth, subYears } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  monthlySubscription,
  twoMonthlySubscription,
  twoYearlySubscription,
  yearlySubscription,
} from "../../../shared/api/__mocks__/subscription.model.ts";
import type { SubscriptionModel } from "../../../shared/api/subscription.model.ts";
import { startOfYear } from "../../../shared/lib/dates.ts";
import { calculateSubscriptionPriceForYear } from "./calculate-subscription-price-for-year.ts";

describe("calculateSubscriptionPriceForYear", () => {
  describe("monthly", () => {
    it("startedAtYear < year", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 12);
    });

    it("startedAtYear = year", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: setMonth(monthlySubscription.startedAt, 2),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 10);
    });

    it("year < startedAtYear", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: addYears(monthlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("startedAtYear < endedAtYear < year", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: subYears(monthlySubscription.startedAt, 2),
        endedAt: subYears(monthlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("startedAtYear < year = endedAtYear", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: setMonth(subYears(monthlySubscription.startedAt, 1), 2),
        endedAt: setMonth(monthlySubscription.startedAt, 6),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 6);
    });

    it("startedAtYear < year < endedAtYear", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: subYears(monthlySubscription.startedAt, 1),
        endedAt: addYears(monthlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 12);
    });

    it("startedAtYear = year = endedAtYear", () => {
      const subscription = {
        ...monthlySubscription,
        startedAt: setMonth(monthlySubscription.startedAt, 2),
        endedAt: setMonth(monthlySubscription.startedAt, 4),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 2);
    });

    it("each = 2 && startedAtYear < year", () => {
      const subscription = {
        ...twoMonthlySubscription,
        startedAt: subYears(twoMonthlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 6);
    });

    it("each = 2 && startedAtYear = year", () => {
      const subscription = {
        ...twoMonthlySubscription,
        startedAt: setMonth(twoMonthlySubscription.startedAt, 2),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 5);
    });

    it("each = 2 && year = endedAtYear", () => {
      const subscription = {
        ...twoMonthlySubscription,
        startedAt: setMonth(subYears(twoMonthlySubscription.startedAt, 1), 2),
        endedAt: setMonth(monthlySubscription.startedAt, 6),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price * 3);
    });
  });

  describe("yearly", () => {
    it("startedAtYear < year", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: subYears(yearlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price);
    });

    it("startedAtYear = year", () => {
      const subscription = {
        ...yearlySubscription,
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price);
    });

    it("year < startedAtYear", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: addYears(yearlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("startedAtYear < endedAtYear < year", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: subYears(yearlySubscription.startedAt, 2),
        endedAt: subYears(yearlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("startedAtYear < year = endedAtYear", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: subYears(yearlySubscription.startedAt, 2),
        endedAt: yearlySubscription.startedAt,
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("startedAtYear < year < endedAtYear", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: subYears(yearlySubscription.startedAt, 1),
        endedAt: addYears(yearlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price);
    });

    it("startedAtYear = year < endedAtYear", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: yearlySubscription.startedAt,
        endedAt: addYears(yearlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price);
    });

    it("year < startedAtYear < endedAtYear", () => {
      const subscription = {
        ...yearlySubscription,
        startedAt: addYears(yearlySubscription.startedAt, 1),
        endedAt: addYears(yearlySubscription.startedAt, 2),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("each = 2 && && startedAtYear % year = 1", () => {
      const subscription = {
        ...twoYearlySubscription,
        startedAt: subYears(twoYearlySubscription.startedAt, 1),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(0);
    });

    it("each = 2 && startedAtYear % year = 0", () => {
      const subscription = {
        ...twoYearlySubscription,
        startedAt: subYears(twoYearlySubscription.startedAt, 2),
      } satisfies SubscriptionModel;

      expect(
        calculateSubscriptionPriceForYear(subscription, startOfYear),
      ).toEqual(subscription.price);
    });
  });
});
