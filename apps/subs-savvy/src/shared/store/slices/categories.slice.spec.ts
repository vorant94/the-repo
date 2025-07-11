import {
  act,
  type RenderHookResult,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { categoryMock } from "../../api/__mocks__/category.model.ts";
import type { CategoryModel } from "../../api/category.model.ts";
import { useCategories, useSelectedCategory, useStore } from "../hooks.ts";
import { StoreTestWrapper } from "../test.utils.tsx";

vi.mock(import("../../api/category.table.ts"));

describe("categories.slice", () => {
  let screen: RenderHookResult<HooksCombined, void>;
  let hook: RenderHookResult<HooksCombined, void>["result"];

  beforeEach(() => {
    screen = renderHook<HooksCombined, void>(
      () => {
        const categories = useCategories();
        const selectedCategory = useSelectedCategory();

        return {
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

  it("should fetch categories", async () => {
    await Promise.all([
      waitFor(() => expect(hook.current.selectedCategory).toBeFalsy()),
      waitFor(() => expect(hook.current.categories).toEqual([categoryMock])),
    ]);
  });

  it("should throw when trying to select category with wrong id", async () => {
    // not real validation, but just to ensure that component is stable and is ready for upcoming `act` to be called
    await waitFor(() => expect(hook.current.categories.length).toEqual(1));

    // don't know how to check error type here, it isn't bubbling up to ErrorBoundary#onError for some reason
    expect(() =>
      act(() => useStore.getState().selectCategory("7")),
    ).toThrowError();
  });
});

interface HooksCombined {
  categories: ReadonlyArray<CategoryModel>;
  selectedCategory: CategoryModel | null;
}
