import {
  type RenderHookResult,
  act,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { categoryMock } from "../../api/__mocks__/category.model.ts";
import {
  monthlySubscription,
  yearlySubscription,
} from "../../api/__mocks__/subscription.model.ts";
import type { CategoryModel } from "../../api/category.model.ts";
import type { SubscriptionModel } from "../../api/subscription.model.ts";
import {
  useCategories,
  useSelectedCategory,
  useStore,
  useSubscriptions,
} from "../hooks.ts";
import { StoreTestWrapper } from "../test.utils.tsx";

vi.mock(import("../../api/category.table.ts"));
vi.mock(import("../../api/subscription.table.ts"));

describe("subscriptions.slice", () => {
  let screen: RenderHookResult<HooksCombined, void>;
  let hook: RenderHookResult<HooksCombined, void>["result"];

  beforeEach(() => {
    screen = renderHook<HooksCombined, void>(
      () => {
        const subscriptions = useSubscriptions();
        const categories = useCategories();
        const selectedCategory = useSelectedCategory();

        return {
          subscriptions,
          categories,
          selectedCategory,
        };
      },
      {
        wrapper: StoreTestWrapper,
      },
    );

    hook = screen.result;
  });

  it("should fetch subscriptions", async () => {
    await Promise.all([
      waitFor(() =>
        expect(hook.current.subscriptions).toEqual([
          monthlySubscription,
          yearlySubscription,
        ]),
      ),
    ]);
  });

  it("should filter/unfilter subscriptions based on selected category", async () => {
    const categoryToSelect = {
      ...categoryMock,
    } satisfies CategoryModel;

    // not real validation, but just to ensure that component is stable and is ready for upcoming `act` to be called
    await waitFor(() => expect(hook.current.categories.length).toEqual(1));

    act(() => useStore.getState().selectCategory(`${categoryToSelect.id}`));
    await Promise.all([
      waitFor(() =>
        expect(hook.current.selectedCategory?.id).toEqual(categoryToSelect.id),
      ),
      waitFor(() => expect(hook.current.subscriptions.length).toEqual(1)),
    ]);

    act(() => useStore.getState().deselectCategory());
    await Promise.all([
      waitFor(() => expect(hook.current.selectedCategory).toBeFalsy()),
      waitFor(() => expect(hook.current.subscriptions.length).toEqual(2)),
    ]);
  });
});

interface HooksCombined {
  subscriptions: ReadonlyArray<SubscriptionModel>;
  categories: ReadonlyArray<CategoryModel>;
  selectedCategory: CategoryModel | null;
}
