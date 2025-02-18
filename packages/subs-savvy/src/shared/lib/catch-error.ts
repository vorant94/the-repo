import type { Constructor } from "./constructor.ts";

export function catchError<T, E extends Constructor<Error>>(
  callback: () => T,
  errorsTypesToCatch?: Array<E>,
): [undefined, T] | [InstanceType<E>] {
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

export async function catchErrorAsync<T, E extends Constructor<Error>>(
  promise: Promise<T>,
  errorsTypesToCatch?: Array<E>,
): Promise<[undefined, T] | [InstanceType<E>]> {
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
