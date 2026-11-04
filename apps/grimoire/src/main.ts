#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import dedent from "dedent";
import { z } from "zod";
import { compare } from "./commands/compare.ts";
import { merge } from "./commands/merge.ts";
import { normalize } from "./commands/normalize.ts";
import { split } from "./commands/split.ts";
import { formatBinder } from "./formatters/collection.ts";
import { formatDeck } from "./formatters/deck.ts";
import { parseCollection } from "./parsers/collection.ts";
import { parseDeck } from "./parsers/deck.ts";

const help = dedent`
  Usage:
    grimoire merge <deck...> [--outputPath out/merged.txt]
    grimoire compare <deck...>
    grimoire normalize <deck> [--outputPath out/normalized.txt]
    grimoire split <collection> [--outputDir out]

  merge    Keep the maximum quantity of each card across decks.
  compare  Report the percentage of cards whose names occur in every deck.
  normalize Prefer configured replacements while preserving deck sections.
  split    Export ManaBox lists and B3- binders, excluding proxies.

  Paths are relative to the current working directory.
  Use --help or -h to show this help. Use -- before paths starting with '-'.
`;

const argsSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("merge"),
    paths: z.array(z.string()).min(1),
    outputPath: z.string().default("out/merged.txt"),
    outputDir: z.never().optional(),
  }),
  z.object({
    command: z.literal("compare"),
    paths: z.array(z.string()).min(2),
    outputPath: z.never().optional(),
    outputDir: z.never().optional(),
  }),
  z.object({
    command: z.literal("normalize"),
    paths: z.tuple([z.string()]),
    outputPath: z.string().default("out/normalized.txt"),
    outputDir: z.never().optional(),
  }),
  z.object({
    command: z.literal("split"),
    paths: z.tuple([z.string()]),
    outputPath: z.never().optional(),
    outputDir: z.string().default("out"),
  }),
]);

try {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      outputPath: { type: "string" },
      outputDir: { type: "string" },
    },
  });

  const [command, ...paths] = positionals;
  const args = values.help
    ? { command: "help" as const }
    : argsSchema.parse({
        command,
        paths,
        outputPath: values.outputPath,
        outputDir: values.outputDir,
      });

  switch (args.command) {
    case "help": {
      process.stdout.write(`${help}\n`);
      break;
    }
    case "split": {
      const content = await readText(args.paths[0]);
      const collection = parseCollection(content);
      const [tradelist, wishlist] = split(collection);
      const tradelistOutput = formatBinder(tradelist);
      const wishlistOutput = formatBinder(wishlist);
      await mkdir(args.outputDir, { recursive: true });
      await writeFile(join(args.outputDir, "tradelist.csv"), tradelistOutput);
      await writeFile(join(args.outputDir, "wishlist.csv"), wishlistOutput);
      break;
    }
    case "compare": {
      const contents = await Promise.all(args.paths.map(readText));
      const decks = contents.map(parseDeck);
      const similarity = compare(decks);
      process.stdout.write(`Deck similarity: ${similarity.toFixed(2)}%\n`);
      break;
    }
    case "normalize": {
      const content = await readText(args.paths[0]);
      const deck = parseDeck(content);
      const normalized = normalize(deck);
      const output = formatDeck(normalized);
      await mkdir(dirname(args.outputPath), { recursive: true });
      await writeFile(args.outputPath, output);
      break;
    }
    case "merge": {
      const contents = await Promise.all(args.paths.map(readText));
      const decks = contents.map(parseDeck);
      const merged = merge(decks);
      const output = formatDeck(merged);
      await mkdir(dirname(args.outputPath), { recursive: true });
      await writeFile(args.outputPath, output);
      break;
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function readText(path: string): Promise<string> {
  const bytes = await readFile(path);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
