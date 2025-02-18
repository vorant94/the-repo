import { type RenderHookResult, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLanguage } from "./use-language.ts";

describe("useLanguage", () => {
  let renderResult: RenderHookResult<string, void>;
  let hooks: RenderHookResult<string, void>["result"];

  beforeEach(() => {
    renderResult = renderHook<string, void>(() => useLanguage());

    hooks = renderResult.result;
  });

  it("should return default language", () => {
    expect(hooks.current).toEqual("en");
  });

  it.todo(
    "should change language when browser language change if new one is supported",
  );

  it.todo(
    "shouldn't change language when browser language change if new one isn't supported",
  );
});
