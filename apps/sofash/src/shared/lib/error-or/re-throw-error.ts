import type { Constructor } from "../constructor.ts";
import type { ErrorOr } from "./error-or.ts";

export async function reThrowError<T, E extends Constructor<Error>>(
  result: Promise<ErrorOr<T, E>>,
): Promise<T>;
export function reThrowError<T, E extends Constructor<Error>>(
  result: ErrorOr<T, E>,
): T;
export function reThrowError<T, E extends Constructor<Error>>(
  result: Promise<ErrorOr<T, E>> | ErrorOr<T, E>,
): Promise<T> | T {
  if (result instanceof Promise) {
    return reThrowErrorAsync(result);
  }

  return reThrowErrorSync(result);
}

function reThrowErrorSync<T, E extends Constructor<Error>>(
  result: ErrorOr<T, E>,
): T {
  const [error, data] = result;
  if (error) {
    throw error;
  }

  return data as T;
}

async function reThrowErrorAsync<T, E extends Constructor<Error>>(
  result: Promise<ErrorOr<T, E>>,
): Promise<T> {
  const [error, data] = await result;
  if (error) {
    throw error;
  }

  return data as T;
}
