#!/usr/bin/env -S node --experimental-strip-types
import { parseArgs } from "node:util";
import { z } from "zod";
import { merge } from "./commands/merge.ts";
import { scrapPauper } from "./commands/scrap-pauper.ts";
import { wishTrade } from "./commands/wish-trade.ts";

const {
  positionals: [rawSubcommand],
} = parseArgs({
  allowPositionals: true,
  strict: false,
});

const subcommandSchema = z.enum(["wish-trade", "merge", "scrap-pauper"]);
type Subcommand = z.infer<typeof subcommandSchema>;
const subcommand = subcommandSchema.parse(rawSubcommand);

// Strip subcommand from argv so subsequent parseArgs calls don't see it
process.argv.splice(2, 1);

const router = {
  "wish-trade": wishTrade,
  merge: merge,
  "scrap-pauper": scrapPauper,
} as const satisfies Record<Subcommand, () => Promise<void>>;

await router[subcommand]();
