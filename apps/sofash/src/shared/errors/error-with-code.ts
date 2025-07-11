export interface ErrorWithCode extends Error {
  code: string;
}

export function isErrorWithCode(err: unknown): err is ErrorWithCode {
  return err instanceof Error && "code" in err && typeof err.code === "string";
}
