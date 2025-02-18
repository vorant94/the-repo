// biome-ignore lint/suspicious/noExplicitAny: unknown instead of any breaks usage of catchError with ZodError somehow
export type Constructor<Instance, Args extends Array<any> = Array<any>> = new (
  ...args: Args
) => Instance;
