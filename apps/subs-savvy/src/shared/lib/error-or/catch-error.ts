import type { Constructor } from "./constructor.ts";
import type { ErrorOr } from "./error-or.ts";

export function catchError<T, E extends Constructor<Error>>(
  promise: Promise<T>,
  errorsTypesToCatch?: Array<E>,
): Promise<ErrorOr<T, E>>;
export function catchError<T, E extends Constructor<Error>>(
  callback: () => T,
  errorsTypesToCatch?: Array<E>,
): ErrorOr<T, E>;
export function catchError<T, E extends Constructor<Error>>(
  promiseOrCallback: Promise<T> | (() => T),
  errorsTypesToCatch?: Array<E>,
): Promise<ErrorOr<T, E>> | ErrorOr<T, E> {
  if (promiseOrCallback instanceof Promise) {
    return catchErrorAsync(promiseOrCallback, errorsTypesToCatch);
  }

  return catchErrorSync(promiseOrCallback, errorsTypesToCatch);
}

function catchErrorSync<T, E extends Constructor<Error>>(
  callback: () => T,
  errorsTypesToCatch?: Array<E>,
): ErrorOr<T, E> {
  try {
    return [undefined, callback()];
  } catch (e) {
    if (!errorsTypesToCatch) {
      console.error(e);
      return [e as InstanceType<E>];
    }

    if (errorsTypesToCatch.some((errorType) => e instanceof errorType)) {
      console.error(e);
      return [e as InstanceType<E>];
    }

    throw e;
  }
}

async function catchErrorAsync<T, E extends Constructor<Error>>(
  promise: Promise<T>,
  errorsTypesToCatch?: Array<E>,
): Promise<ErrorOr<T, E>> {
  try {
    return [undefined, await promise];
  } catch (e) {
    if (!errorsTypesToCatch) {
      console.error(e);
      return [e as InstanceType<E>];
    }

    if (errorsTypesToCatch.some((errorType) => e instanceof errorType)) {
      console.error(e);
      return [e as InstanceType<E>];
    }

    throw e;
  }
}
