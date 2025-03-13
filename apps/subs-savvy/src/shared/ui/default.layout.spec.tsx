import { type RenderHookResult, act, renderHook } from "@testing-library/react";
import { MemoryRouter, type NavigateFunction, useNavigate } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DefaultLayoutProvider,
  type UseDefaultLayout,
  useDefaultLayout,
} from "./default.layout.tsx";

describe("useDefaultLayout", () => {
  let renderResult: RenderHookResult<HooksCombined, void>;
  let hooks: RenderHookResult<HooksCombined, void>["result"];

  beforeEach(() => {
    renderResult = renderHook<HooksCombined, void>(
      () => ({
        navigate: useNavigate(),
        defaultLayout: useDefaultLayout(),
      }),
      {
        wrapper: ({ children }) => {
          return (
            <MemoryRouter>
              <DefaultLayoutProvider>{children}</DefaultLayoutProvider>
            </MemoryRouter>
          );
        },
      },
    );

    hooks = renderResult.result;
  });

  it("should close nav on router navigation", () => {
    act(() => hooks.current.defaultLayout.nav.open());
    act(() => hooks.current.navigate("/foo"));

    expect(hooks.current.defaultLayout.isNavOpened).toBeFalsy();
  });
});

interface HooksCombined {
  navigate: NavigateFunction;
  defaultLayout: UseDefaultLayout;
}
