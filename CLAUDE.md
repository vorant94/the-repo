# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Monorepo with npm workspaces, Turbo for build orchestration, and Biome for linting/formatting.

**Structure:**
- `apps/digital-garden` - Astro blog (Cloudflare Pages)
- `apps/grimoire` - MTG collection CLI (ManaBox→Archidekt conversion, deck merging, staples scraping)
- `apps/sofash` - WIP Telegram bot for local events (Hono, Grammy, Drizzle ORM, D1/LibSQL)
- `apps/subs-savvy` - Abandoned subscription tracker (React, Dexie/IndexedDB)
- `libs/cn` - TailwindCSS className utility (clsx + tailwind-merge)
- `libs/nt` - NeverThrow wrapper utilities
- `tools/studio` - Remotion studio for asset generation

## Commands

**Root:**
```bash
npm install
npm run lint:check|write|write:unsafe|ci  # Biome linting (always run from root)
npx turbo ts:check                        # TypeScript across workspaces
npx turbo test                            # Tests across workspaces
npm run deps-mismatch:check|fix           # Dependency version management
npm run unused-code:check                 # Knip unused code analysis
```

**Common per-project:** Most apps support `start:dev`, `build`, `ts:check`. E2E projects add `e2e:install`, `e2e`, `e2e:ui`. Deploy commands vary by platform (Cloudflare Pages/Workers).

**grimoire:** Install globally with `npm link` from apps/grimoire, then run anywhere:
```bash
grimoire wish-trade [--inputPath ManaBox_Collection.csv] [--outputDir .]
grimoire merge <deck1> <deck2> [...deckN] [--outputPath merged-decklist.txt]
grimoire scrap-pauper [--url https://paupergeddon.com/Top64.html] [--outputPath pauper-staples.txt]
grimoire spectate --url <youtube-url> [--outputPath transcript.txt]
```

**sofash database:** `npx drizzle-kit generate|migrate` locally, `npm run migrate:prod` for production D1. Drizzle config points to src/shared/schema for schema definitions and ./drizzle for migrations output.

## Architecture

**sofash (layered):** `api/` (Hono routes, Grammy handlers) → `bl/` (business logic) → `dal/` (data access). Uses AsyncLocalStorage for request-scoped context management.

**subs-savvy (FSD):** `app/` → `pages/` → `widgets/` → `features/` → `entities/` → `shared/`. Zustand state, Dexie DB ops with Zod validation. (Abandoned but reference patterns.)

**digital-garden:** Astro content collections in src/content.config.ts, posts in src/posts/, i18n support, custom rehype/remark plugins.

**grimoire:** Single entry main.ts with subcommand routing. Commands in src/commands/, each self-contained with config at top. Uses `--experimental-strip-types` for direct TS execution. Shebang in main.ts allows execution via npm bin.

## Code Style (Biome)

Always run Biome from repo root. Rules enforced:
- No default exports (except config files, main.ts, Astro files)
- Kebab-case filenames
- No barrel files (except `libs/*/src/index.ts`)
- No namespace imports (except test files for mocking)
- No `console.log` (use `.error`, `.info`, `.debug`)
- `Array<T>` not `T[]`
- Always use braces: `if (!value) { continue; }` not `if (!value) continue;`
- Never use biome-ignore except for external naming conventions (CSV headers, third-party APIs)

## Testing

**Test naming convention:**
- `*.unit.test.ts` - Pure logic, no I/O (formatters, parsers, utilities)
- `*.int.test.ts` - Direct function calls with mocked I/O (fetch, fs, process)
- `*.e2e.test.ts` - Full process execution (spawn CLI binary)
- Legacy `*.spec.ts` patterns still supported but prefer the above

**Mocking pattern:**
- Use `vi.spyOn(target, "method").mockImplementationOnce()` for one-time mocks (auto-expires after first call, no manual cleanup needed)

**Integration test pattern:**
- Call functions directly with mocked I/O instead of spawning processes
- Store fixtures in `@app/grimoire/assets/` folder (e.g., `assets/scrap-pauper-fixture.html`)

**General:**
- Vitest for subs-savvy and grimoire
- Playwright for digital-garden E2E
- Prefer `it()` over `test()`, use `describe()` blocks

## Git Hooks (lefthook)

**pre-commit:** `npm run lint:ci`, `npx turbo ts:check`
**pre-push:** `npx turbo test`, `npm run unused-code:check`, `npm run deps-mismatch:check`

## Programming Preferences

**Philosophy:**
- Simplicity over abstraction—remove abstractions until needed
- Minimal dependencies—prefer native APIs, reuse monorepo deps
- Only export what other files need (Knip catches unused exports)
- Early returns always: `if (!value) { return; }` not `if (value) { ... }` — applies to all contexts including small functions, disposal handlers, etc.
- Avoid unnecessary nesting—main logic flows without deep nesting
- When approach fails: investigate, present findings, stop and wait
- Use `dedent` package for multiline strings (enables proper indentation in source code while removing it at runtime)
- Prefer optional chaining (`?.`) over explicit null/undefined checks when supported by language spec
- Use `null` for explicit "nothing" values, not `undefined` — `undefined` is for implicit absence (optional params)
- Don't add default values to optional parameters when implicit `undefined` is acceptable: `param?: Type` not `param?: Type = defaultValue`

**HTML parsing:** Prefer semantic selectors (class names) over regex, simple string methods over regex when possible.

**TypeScript:**
```typescript
// satisfies for type safety
const format = "Pauper" satisfies Format;
export const Format = { pauper: "Pauper" } as const satisfies Record<string, Format>;

// interface for objects, type for unions
export interface TempDir { path: string; cleanup: () => Promise<void>; }
type Status = "pending" | "completed";

// Optional properties/params: use ?: not | undefined
export interface Foo { title?: string; }  // not title: string | undefined
function bar(title?: string) {}           // not title: string | undefined

// Optional and nullable: parameters can be both
function baz(debugFileName?: string | null) {}  // accepts string, null, or undefined (omitted)

// Type-only imports, explicit node: protocol
import type { Format } from "./types";
import process from "node:process";

// Zod: schema once, infer type, export both
const rowSchema = z.object({ name: z.string(), value: z.number() });
type Row = z.infer<typeof rowSchema>;

// Use type aliases instead of inline inference
export const chapterSchema = z.object({ title: z.string() });
export type Chapter = z.infer<typeof chapterSchema>;  // export and reuse everywhere
// NOT: Array<z.infer<typeof chapterSchema>> at each usage site
```

**Zod parsing:** Use `.parse()` by default—let validation errors throw naturally. Only use `.safeParse()` for user-facing validation needing graceful error messages.

**Naming:** lowerCamelCase for all variables including constants (`basicLands` not `BASIC_LANDS`). SCREAMING_CASE creates false immutability since objects remain mutable.

**Modern TypeScript:** Top-level await (no main wrappers). No enums (`erasableSyntaxOnly: true`)—use type unions + const objects.

**CLI patterns:**
- camelCase CLI args matching schema fields for direct `parseArgs` → Zod pass-through
- Avoid unnecessary `.min(1)` validation—`z.string()` suffices for required args
- Don't rename in destructuring—name things explicitly from the start
- Consistent structure: imports → constants → schema → parseArgs → validation → execution
- Don't abstract until 5+ instances or truly complex shared logic

**Project organization:**
- Organize for extensibility even with single implementation
- Define configuration variables at top of entry files
- Use clear, explicit variable names

## Git Workflow

- Do not commit unless explicitly asked—edit files and leave for user review

## Requirements

Node.js >= 23, npm >= 11.2.0, macOS/Linux only
