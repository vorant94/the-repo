import { type RenderHookResult, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCurrency } from "./use-currency.ts";

describe("useCurrency", () => {
  let renderResult: RenderHookResult<string, void>;
  let hooks: RenderHookResult<string, void>["result"];

  beforeEach(() => {
    renderResult = renderHook<string, void>(() => useCurrency());

    hooks = renderResult.result;
  });

  it("should return default currency", () => {
    expect(hooks.current).toEqual("USD");
  });
});
