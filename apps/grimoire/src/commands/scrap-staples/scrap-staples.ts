import { type ParseArgsConfig, parseArgs } from "node:util";
import { log } from "@clack/prompts";
import { outputFile } from "fs-extra";
import { z } from "zod";
import { accent } from "../../shared/logger.ts";
import { fetchPage } from "./fetch-page.ts";
import { formatOutput } from "./format-output.ts";
import { parsePauperCards } from "./pauper.ts";
import { parsePdhCards } from "./pdh.ts";

export async function scrapStaples() {
  const { values, positionals } = parseArgs({
    options,
    allowPositionals: true,
    strict: true,
  });

  const [format] = positionalsSchema.parse(positionals);
  const config = formats[format];
  const { outputPath } = config.argsSchema.parse(values);

  const html = await fetchPage(config.url);
  const cardNames = config.parseCards(html);
  const output = formatOutput(cardNames);

  log.step(`Writing to ${accent(outputPath)}...`);
  await outputFile(outputPath, output, "utf-8");
  log.success("Done!");
}

const formatSchema = z.enum(["pauper", "pdh"]);
type Format = z.infer<typeof formatSchema>;

const positionalsSchema = z.tuple([formatSchema]);

const pauperArgsSchema = z.object({
  outputPath: z.string().default("./pauper-staples.txt"),
});

const pdhArgsSchema = z.object({
  outputPath: z.string().default("./pdh-staples.txt"),
});

interface FormatConfig {
  url: string;
  argsSchema: typeof pauperArgsSchema | typeof pdhArgsSchema;
  parseCards: (html: string) => Set<string>;
}

const formats = {
  pauper: {
    url: "https://paupergeddon.com/Top64.html",
    argsSchema: pauperArgsSchema,
    parseCards: parsePauperCards,
  },
  pdh: {
    url: "https://www.pdhrec.com/staples/",
    argsSchema: pdhArgsSchema,
    parseCards: parsePdhCards,
  },
} as const satisfies Record<Format, FormatConfig>;

const options = {
  outputPath: { type: "string" },
} as const satisfies ParseArgsConfig["options"];
