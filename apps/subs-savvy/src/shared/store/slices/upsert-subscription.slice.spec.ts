import { type RenderHookResult, act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  type UseDefaultLayout,
  useDefaultLayout,
} from "../../ui/default.layout.tsx";
import { useStore, useUpsertSubscription } from "../hooks.ts";
import { StoreTestWrapper } from "../test.utils.tsx";
import type { UpsertSubscriptionState } from "../types.ts";

describe("upsert-subscription.slice", () => {
  let renderResult: RenderHookResult<HooksCombined, void>;
  let hooks: RenderHookResult<HooksCombined, void>["result"];

  beforeEach(() => {
    renderResult = renderHook<HooksCombined, void>(
      () => ({
        state: useUpsertSubscription(),
        defaultLayout: useDefaultLayout(),
      }),
      {
        wrapper: StoreTestWrapper,
      },
    );

    hooks = renderResult.result;
  });

  it("should open/close drawer on upsert open/close", () => {
    act(() => useStore.getState().openUpsertSubscription());
    expect(hooks.current.defaultLayout.isDrawerOpened).toBeTruthy();

    act(() => useStore.getState().closeUpsertSubscription());
    expect(hooks.current.defaultLayout.isDrawerOpened).toBeFalsy();
  });

  it("should close upsert on drawer close", () => {
    act(() => useStore.getState().openUpsertSubscription());
    expect(hooks.current.defaultLayout.isDrawerOpened).toBeTruthy();

    act(() => hooks.current.defaultLayout.drawer.close());
    expect(hooks.current.state.upsertSubscriptionMode).toBeFalsy();
  });

  it(`shouldn't open upsert on drawer open`, () => {
    act(() => hooks.current.defaultLayout.drawer.open());
    expect(hooks.current.state.upsertSubscriptionMode).toBeFalsy();
  });
});

interface HooksCombined {
  state: UpsertSubscriptionState;
  defaultLayout: UseDefaultLayout;
}
