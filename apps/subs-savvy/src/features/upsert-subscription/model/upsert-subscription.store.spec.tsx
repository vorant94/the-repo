import { type RenderHookResult, act, renderHook } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DefaultLayoutProvider,
  type UseDefaultLayout,
  useDefaultLayout,
} from "../../../shared/ui/default.layout.tsx";
import {
  type UpsertSubscriptionActions,
  UpsertSubscriptionProvider,
  type UpsertSubscriptionState,
  useUpsertSubscriptionActions,
  useUpsertSubscriptionMode,
} from "./upsert-subscription.store.tsx";

describe("upsert-subscription.store", () => {
  let renderResult: RenderHookResult<HooksCombined, void>;
  let hooks: RenderHookResult<HooksCombined, void>["result"];

  beforeEach(() => {
    renderResult = renderHook<HooksCombined, void>(
      () => ({
        mode: useUpsertSubscriptionMode(),
        actions: useUpsertSubscriptionActions(),
        defaultLayout: useDefaultLayout(),
      }),
      {
        wrapper: ({ children }) => {
          return (
            <BrowserRouter>
              <DefaultLayoutProvider>
                <UpsertSubscriptionProvider>
                  {children}
                </UpsertSubscriptionProvider>
              </DefaultLayoutProvider>
            </BrowserRouter>
          );
        },
      },
    );

    hooks = renderResult.result;
  });

  it("should open/close drawer on upsert open/close", () => {
    act(() => hooks.current.actions.open());
    expect(hooks.current.defaultLayout.isDrawerOpened).toBeTruthy();

    act(() => hooks.current.actions.close());
    expect(hooks.current.defaultLayout.isDrawerOpened).toBeFalsy();
  });

  it("should close upsert on drawer close", () => {
    act(() => hooks.current.actions.open());
    expect(hooks.current.defaultLayout.isDrawerOpened).toBeTruthy();

    act(() => hooks.current.defaultLayout.drawer.close());
    expect(hooks.current.mode).toBeFalsy();
  });

  it(`shouldn't open upsert on drawer open`, () => {
    act(() => hooks.current.defaultLayout.drawer.open());
    expect(hooks.current.mode).toBeFalsy();
  });
});

interface HooksCombined {
  mode: UpsertSubscriptionState["mode"];
  actions: UpsertSubscriptionActions;
  defaultLayout: UseDefaultLayout;
}
