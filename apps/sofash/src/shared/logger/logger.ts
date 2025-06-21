import { styleText } from "node:util";
import { format } from "date-fns";
import { getContext } from "../context/context.ts";

export function createLogger(name: string): Logger {
  names.push(name);

  logger.debug("start");

  return logger;
}

export type LoggerFn = (...args: Array<unknown>) => void;

export interface Logger extends Disposable {
  debug: LoggerFn;
  info: LoggerFn;
  error: LoggerFn;
}

type LogLevel = "debug" | "info" | "error";

const logger: Logger = {
  debug(...args: Array<unknown>): void {
    console.debug(...formatMessage("debug", ...args));
  },
  info(...args: Array<unknown>): void {
    console.info(...formatMessage("info", ...args));
  },
  error(...args: Array<unknown>): void {
    console.error(...formatMessage("error", ...args));
  },
  [Symbol.dispose]() {
    logger.debug("end");
    names.pop();
  },
};

const names: Array<string> = [];

function formatMessage(
  logLevel: LogLevel,
  ...args: Array<unknown>
): Array<unknown> {
  return [
    formatRequestId(),
    formatTime(),
    formatLogLevel(logLevel),
    formatName(logLevel),
    ...args,
  ];
}

function formatRequestId(): string {
  const { requestId } = getContext();

  return `${styleText("cyan", `[${requestId}]`)} -`;
}

function formatTime(): string {
  return `${styleText("magenta", format(Date.now(), "yyyy/MM/dd, HH:mm:ss"))} -`;
}

const logLevelToFormatModifiers = {
  debug: "gray",
  info: "blue",
  error: "red",
} as const satisfies Record<LogLevel, Parameters<typeof styleText>[0]>;

function formatLogLevel(logLevel: LogLevel): string {
  return `${styleText(logLevelToFormatModifiers[logLevel], logLevel.toUpperCase())}\t`;
}

function formatName(logLevel: LogLevel): string {
  const name = names.at(-1);

  return name
    ? styleText(logLevelToFormatModifiers[logLevel], `[${name}]`)
    : "";
}
