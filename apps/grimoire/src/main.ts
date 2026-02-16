#!/usr/bin/env -S node --experimental-strip-types
import process from "node:process";
import { parseArgs } from "node:util";
import { z } from "zod";
import { merge } from "./commands/merge.ts";
import { scrapStaples } from "./commands/scrap-staples/scrap-staples.ts";
import { spectate } from "./commands/spectate/spectate.ts";
import { wishTrade } from "./commands/wish-trade.ts";

const {
  positionals: [rawSubcommand],
} = parseArgs({
  allowPositionals: true,
  strict: false,
});

const subcommandSchema = z.enum([
  "wish-trade",
  "merge",
  "scrap-staples",
  "spectate",
]);
type Subcommand = z.infer<typeof subcommandSchema>;
const subcommand = subcommandSchema.parse(rawSubcommand);

// Strip subcommand from argv so subsequent parseArgs calls don't see it
process.argv.splice(2, 1);

const router = {
  "wish-trade": wishTrade,
  merge: merge,
  "scrap-staples": scrapStaples,
  spectate: spectate,
} as const satisfies Record<Subcommand, () => Promise<void>>;

await router[subcommand]();
