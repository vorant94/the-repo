import {
  type RenderHookResult,
  act,
  renderHook,
  waitFor,
} from "@testing-library/react";
import {
  type MockInstance,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { categoryMock } from "../../api/__mocks__/category.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "../../api/__mocks__/subscription.model.ts";
import type { CategoryModel } from "../../api/category.model.ts";
import type { RecoveryModel } from "../../api/recovery.model.ts";
import * as recoveryTable from "../../api/recovery.table.ts";
import type { SubscriptionModel } from "../../api/subscription.model.ts";
import { dbVersion } from "../../lib/db.ts";
import { useImportRecovery, useStore } from "../hooks.ts";
import { StoreTestWrapper } from "../test.utils.tsx";
import type { ImportRecoveryState } from "../types.ts";

vi.mock(import("../../api/recovery.table.ts"));

describe("import-recovery.slice", () => {
  let renderResult: RenderHookResult<ImportRecoveryState, void>;
  let hooks: RenderHookResult<ImportRecoveryState, void>["result"];
  const initialState = useStore.getState();
  const recovery = {
    dbVersion,
    subscriptions: [monthlySubscription, yearlySubscription],
    categories: [categoryMock],
  } as const satisfies RecoveryModel;

  beforeEach(() => {
    renderResult = renderHook<ImportRecoveryState, void>(
      () => useImportRecovery(),
      {
        wrapper: StoreTestWrapper,
      },
    );

    hooks = renderResult.result;
  });

  afterEach(() => {
    useStore.setState(initialState, true);
  });

  it("should initially be in 'upload-recovery' stage", () => {
    expect(hooks.current.importStage).toEqual("upload-recovery");
    expect(hooks.current.subscriptionsToImport).toEqual([]);
    expect(hooks.current.categoriesToImport).toEqual([]);
  });

  describe("upload-recovery <=> submit-categories", () => {
    it("should go next", () => {
      act(() => useStore.getState().goNextFromUploadRecovery(recovery));

      expect(hooks.current.importStage).toEqual("submit-categories");
      expect(hooks.current.subscriptionsToImport).toEqual(
        recovery.subscriptions,
      );
      expect(hooks.current.categoriesToImport).toEqual(recovery.categories);
    });

    it("should go next and extract categories from subscriptions if they are missing separately", () => {
      const recovery = {
        dbVersion,
        subscriptions: [monthlySubscription, yearlySubscription],
        categories: [],
      } as const satisfies RecoveryModel;

      act(() => useStore.getState().goNextFromUploadRecovery(recovery));

      expect(hooks.current.importStage).toEqual("submit-categories");
      expect(hooks.current.subscriptionsToImport).toEqual(
        recovery.subscriptions,
      );
      expect(hooks.current.categoriesToImport).toEqual([categoryMock]);
    });

    it("should go prev and reset subscriptions and categories", () => {
      act(() => useStore.getState().goNextFromUploadRecovery(recovery));
      act(() => useStore.getState().goPrevFromSubmitCategories());

      expect(hooks.current.importStage).toEqual("upload-recovery");
      expect(hooks.current.subscriptionsToImport).toEqual([]);
      expect(hooks.current.categoriesToImport).toEqual([]);
    });
  });

  describe("submit-categories <=> submit-subscriptions", () => {
    beforeEach(() => {
      act(() => useStore.getState().goNextFromUploadRecovery(recovery));
    });

    it("should go next", () => {
      act(() =>
        useStore.getState().goNextFromSubmitCategories(recovery.categories),
      );

      expect(hooks.current.importStage).toEqual("submit-subscriptions");
      expect(hooks.current.subscriptionsToImport).toEqual(
        recovery.subscriptions,
      );
      expect(hooks.current.categoriesToImport).toEqual(recovery.categories);
    });

    it("should go next and adjust categories if they were changed", () => {
      const adjustedCategory = {
        ...categoryMock,
        name: "adjusted",
      } satisfies CategoryModel;
      const subscriptions = [
        { ...monthlySubscription, category: adjustedCategory },
        yearlySubscription,
      ] satisfies Array<SubscriptionModel>;

      act(() =>
        useStore.getState().goNextFromSubmitCategories([adjustedCategory]),
      );

      expect(hooks.current.importStage).toEqual("submit-subscriptions");
      expect(hooks.current.subscriptionsToImport).toEqual(subscriptions);
      expect(hooks.current.categoriesToImport).toEqual([adjustedCategory]);
    });

    it("should go prev", () => {
      act(() =>
        useStore.getState().goNextFromSubmitCategories(recovery.categories),
      );
      act(() =>
        useStore
          .getState()
          .goPrevFromSubmitSubscriptions(recovery.subscriptions),
      );

      expect(hooks.current.importStage).toEqual("submit-categories");
      expect(hooks.current.subscriptionsToImport).toEqual(
        recovery.subscriptions,
      );
      expect(hooks.current.categoriesToImport).toEqual(recovery.categories);
    });

    it("should go prev and adjust subscriptions if they were changed", () => {
      const subscriptions = [
        { ...monthlySubscription, name: "adjusted" },
        yearlySubscription,
      ] satisfies Array<SubscriptionModel>;

      act(() =>
        useStore.getState().goNextFromSubmitCategories(recovery.categories),
      );
      act(() =>
        useStore.getState().goPrevFromSubmitSubscriptions(subscriptions),
      );

      expect(hooks.current.importStage).toEqual("submit-categories");
      expect(hooks.current.subscriptionsToImport).toEqual(subscriptions);
      expect(hooks.current.categoriesToImport).toEqual(recovery.categories);
    });
  });

  describe("submit-subscriptions => completed", () => {
    let upsertCategoriesAndSubscriptionsSpy: MockInstance;

    beforeAll(() => {
      upsertCategoriesAndSubscriptionsSpy = vi.spyOn(
        recoveryTable,
        "upsertCategoriesAndSubscriptions",
      );
    });

    beforeEach(() => {
      act(() => useStore.getState().goNextFromUploadRecovery(recovery));
      act(() =>
        useStore.getState().goNextFromSubmitCategories(recovery.categories),
      );
    });

    it("should go next", async () => {
      await act(() =>
        useStore
          .getState()
          .goNextFromSubmitSubscriptions(recovery.subscriptions),
      );

      await waitFor(() =>
        expect(upsertCategoriesAndSubscriptionsSpy).toBeCalledWith(
          recovery.categories,
          recovery.subscriptions,
        ),
      );
      await waitFor(() =>
        expect(hooks.current.importStage).toEqual("completed"),
      );
    });

    it.todo("should fail gracefully");
  });
});
