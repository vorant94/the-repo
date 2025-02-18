import { describe, expect, it, vi } from "vitest";
import { catchError, catchErrorAsync } from "./catch-error.ts";

describe("catchError", () => {
  it("should return value if no error was thrown", () => {
    const result = "123";
    const callback = () => result;

    expect(catchError(callback)).toEqual([undefined, result]);
  });

  it("should throw if unknown error was thrown", () => {
    const callback = () => {
      throw new Error("test");
    };

    expect(() => catchError(callback, [CustomError])).toThrowError("test");
  });

  it("should return error if known error was thrown", () => {
    const error = new CustomError();
    const callback = () => {
      throw error;
    };

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    expect(catchError(callback, [CustomError])).toEqual([error]);
    expect(consoleSpy, "should log error to console").toBeCalledWith(error);
  });

  it("should return error if no known errors were passed", () => {
    const error = new CustomError();
    const callback = () => {
      throw error;
    };

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    expect(catchError(callback)).toEqual([error]);
    expect(consoleSpy, "should log error to console").toBeCalledWith(error);
  });
});

describe("catchErrorAsync", () => {
  it("should return value if no error was thrown", async () => {
    const result = "123";
    const promise = Promise.resolve(result);

    expect(await catchErrorAsync(promise)).toEqual([undefined, result]);
  });

  it("should throw if unknown error was thrown", async () => {
    const promise = Promise.reject("test");

    await expect(
      async () => await catchErrorAsync(promise, [CustomError]),
    ).rejects.toThrowError("test");
  });

  it("should return error if known error was thrown", async () => {
    const error = new CustomError();
    const promise = Promise.reject(error);

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    expect(await catchErrorAsync(promise, [CustomError])).toEqual([error]);
    expect(consoleSpy, "should log error to console").toBeCalledWith(error);
  });

  it("should return error if no known errors were passed", async () => {
    const error = new CustomError();
    const promise = Promise.reject(error);

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementationOnce(() => {});

    expect(await catchErrorAsync(promise)).toEqual([error]);
    expect(consoleSpy, "should log error to console").toBeCalledWith(error);
  });
});

class CustomError extends Error {
  constructor() {
    super("test");
  }
}
