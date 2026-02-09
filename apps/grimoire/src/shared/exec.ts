import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

export const execFile = promisify(execFileCallback);
