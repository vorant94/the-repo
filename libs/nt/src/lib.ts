import { Result, ResultAsync } from "neverthrow";

export const ntJsonParse = Result.fromThrowable(JSON.parse);

export const ntFetch = ResultAsync.fromThrowable(fetch);

export const ntResponseJson = ResultAsync.fromThrowable((res: Response) =>
  res.json(),
);
