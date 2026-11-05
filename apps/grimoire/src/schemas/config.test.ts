import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { z } from "zod";
import { configSchema } from "./config.ts";

describe("configSchema.parse", () => {
  test("compiles configured binder name patterns", () => {
    const config = {
      split: {
        tradelist: { binderNamePattern: "^Trade-|^Extras$" },
        wishlist: { binderNamePattern: "^Want-" },
      },
    };
    const expected = {
      split: {
        tradelist: { binderNamePattern: /^Trade-|^Extras$/ },
        wishlist: { binderNamePattern: /^Want-/ },
      },
    };

    assert.deepEqual(configSchema.parse(config), expected);
  });

  test("reports invalid regexes at their config path", () => {
    const config = {
      split: {
        tradelist: { binderNamePattern: "[" },
        wishlist: { binderNamePattern: ".*" },
      },
    };
    const expected = ["split", "tradelist", "binderNamePattern"];

    assert.throws(
      () => configSchema.parse(config),
      (error) => {
        assert.ok(error instanceof z.ZodError);
        assert.deepEqual(error.issues[0]?.path, expected);
        return true;
      },
    );
  });

  test("requires patterns for both destinations", () => {
    const config = {
      split: { tradelist: { binderNamePattern: ".*" }, wishlist: {} },
    };
    const expected = ["split", "wishlist", "binderNamePattern"];

    assert.throws(
      () => configSchema.parse(config),
      (error) => {
        assert.ok(error instanceof z.ZodError);
        assert.deepEqual(error.issues[0]?.path, expected);
        return true;
      },
    );
  });
});
