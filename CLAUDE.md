# CLAUDE.md

Guidance to Claude Code (claude.ai/code) for this repo.

## Repository Overview

Monorepo: pnpm workspaces, Biome for lint/format.

**Structure:**
- `apps/digital-garden` - Astro blog (Cloudflare Pages)
- `apps/grimoire` - MTG collection CLI (ManaBox→Archidekt conversion, deck merging, staples scraping)
- `apps/mana-forge` - WIP MTG web tool (React 19, Vite, Mantine UI, Tailwind CSS v4, React Router v7)
- `apps/sofash` - WIP Telegram bot for local events (Hono, Grammy, Drizzle ORM, D1/LibSQL)
- `apps/subs-savvy` - Abandoned subscription tracker (React, Dexie/IndexedDB)
- `libs/cn` - TailwindCSS className utility (clsx + tailwind-merge)
- `libs/nt` - NeverThrow wrapper utilities
- `tools/studio` - Remotion studio for asset generation

## Commands

**Workspace names:** Packages use bare names (e.g. `mana-forge`, `cn`), not `@app/`/`@lib/` scoping. Always check `name` field in target `package.json` before `pnpm --filter <name>`.

**Internal lib dependencies:** Reference workspace libs with workspace protocol: `"cn": "workspace:*"`.

**Root:**
```bash
pnpm install
pnpm run lint:check|write|write:unsafe|ci  # Biome linting (always run from root)
pnpm -r run --if-present ts:check          # TypeScript across workspaces
pnpm -r run --if-present test              # Tests across workspaces
pnpm run unused-code:check                 # Knip unused code analysis
```

**Common per-project:** Most apps support `start:dev`, `build`, `ts:check`. E2E projects add `e2e:install`, `e2e`, `e2e:ui`. Deploy commands vary by platform (Cloudflare Pages/Workers).

**grimoire:** Install globally with `pnpm link --global` from apps/grimoire, then run anywhere:
```bash
grimoire wish-trade [--inputPath ManaBox_Collection.csv] [--outputDir .]
grimoire merge <deck1> <deck2> [...deckN] [--outputPath merged-decklist.txt]
grimoire scrap-pauper [--url https://paupergeddon.com/Top64.html] [--outputPath pauper-staples.txt]
grimoire spectate --url <youtube-url> [--outputPath transcript.txt]
```

**sofash database:** `pnpm exec drizzle-kit generate|migrate` locally, `pnpm run migrate:production` for production D1. Drizzle config: schema at src/shared/schema, migrations output at ./drizzle.

## Architecture

**mana-forge (simple):** `globals/` (route constants) → `layouts/` → `pages/`. React Compiler (babel-plugin-react-compiler) for auto-optimization. PostCSS configured inline in `vite.config.ts` (`css.postcss.plugins`) with postcss-preset-mantine and postcss-simple-vars.

**sofash (layered):** `api/` (Hono routes, Grammy handlers) → `bl/` (business logic) → `dal/` (data access). AsyncLocalStorage for request-scoped context.

**subs-savvy (FSD):** `app/` → `pages/` → `widgets/` → `features/` → `entities/` → `shared/`. Zustand state, Dexie DB ops + Zod validation. PostCSS inline in `vite.config.ts` (`css.postcss.plugins`), not `postcss.config.*`. (Abandoned, reference only.)

**digital-garden:** Astro content collections in src/content.config.ts, posts in src/posts/, i18n, custom rehype/remark plugins.

**grimoire:** Single entry main.ts, subcommand routing. Commands in src/commands/, self-contained with config at top. `--experimental-strip-types` for direct TS execution. Shebang in main.ts for npm bin execution.

## Code Style (Biome)

Always run Biome from repo root. Rules:
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
- Legacy `*.spec.ts` still supported, prefer above

**Mocking pattern:**
- Use `vi.spyOn(target, "method").mockImplementationOnce()` for one-time mocks (auto-expires after first call, no cleanup needed)

**Integration test pattern:**
- Call functions directly with mocked I/O, don't spawn processes
- Store fixtures in `@app/grimoire/assets/` (e.g. `assets/scrap-pauper-fixture.html`)

**General:**
- Vitest for subs-savvy, grimoire, mana-forge; Playwright for digital-garden E2E
- Prefer `it()` over `test()`, use `describe()` blocks
- Test utility functions (fixtures, helpers) go below the describe block, not above it

**jsdom setup (React hook/component tests):**
- Add to vite.config.ts `test` block: `environment: "jsdom"`, `restoreMocks: true`, `setupFiles: ["./src/test-setup.ts"]`
- `restoreMocks: true` required when spying on prototypes — auto-restores after each test
- Mirror `apps/subs-savvy/src/test-setup.ts` for Mantine mocks (getComputedStyle, matchMedia, ResizeObserver, scrollIntoView)

**Mocking modules (`__mocks__` pattern — preferred):**
- For node_modules: `__mocks__/<package>.ts` at app root; scoped packages: `__mocks__/@dnd-kit/core.ts`
- For internal modules: `__mocks__/` sibling directory next to the file being mocked
- Test file still needs `vi.mock(import("..."))` — Vitest uses the `__mocks__` file as implementation

**Mocking read-only DOM properties (jsdom):**
- `clientWidth`, `clientHeight` etc. are getter-only in jsdom — direct assignment throws
- Use `vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800)` per test
- Regular methods (e.g. `getBoundingClientRect`) can be assigned directly on the instance

## Git Hooks (lefthook)

**pre-commit:** `pnpm run lint:ci`, `pnpm -r run --if-present ts:check`
**pre-push:** `pnpm -r run --if-present test`, `pnpm run unused-code:check`

## Programming Preferences

**Philosophy:**
- Simplicity over abstraction — remove abstractions until needed
- Minimal dependencies — prefer native APIs, reuse monorepo deps
- Only export what other files need (Knip catches unused exports)
- Early returns always: `if (!value) { return; }` not `if (value) { ... }` — all contexts including small functions, disposal handlers
- Avoid unnecessary nesting — main logic flows without deep nesting
- When approach fails: investigate, present findings, stop and wait
- Prefer library-native APIs over custom workarounds — check library first before implementing
- Use `dedent` for multiline strings (proper indentation in source, removed at runtime)
- Prefer optional chaining (`?.`) over explicit null/undefined checks when supported
- Use `null` for explicit "nothing", not `undefined` — `undefined` for implicit absence (optional params)
- Don't add default values to optional params when implicit `undefined` acceptable: `param?: Type` not `param?: Type = defaultValue`

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

**Zod parsing:** Use `.parse()` by default — let validation errors throw. Only `.safeParse()` for user-facing validation needing graceful errors.

**Naming:** lowerCamelCase for all variables including constants (`basicLands` not `BASIC_LANDS`). SCREAMING_CASE implies false immutability — objects stay mutable.

**Modern TypeScript:** Top-level await (no main wrappers). No enums (`erasableSyntaxOnly: true`) — use type unions + const objects.

**CLI patterns:**
- camelCase CLI args matching schema fields for direct `parseArgs` → Zod pass-through
- Avoid unnecessary `.min(1)` — `z.string()` suffices for required args
- Don't rename in destructuring — name things right from start
- Consistent structure: imports → constants → schema → parseArgs → validation → execution
- Don't abstract until 5+ instances or truly complex shared logic

**Project organization:**
- Organize for extensibility even with single implementation
- Define config vars at top of entry files
- Use clear, explicit variable names
- Non-exported entities (constants, helpers) go after all exported entities in file
- One component per file — never define multiple components (exported or local) in same file

**Zustand patterns:**
- Use `immer` middleware (`zustand/middleware/immer`) for mutable update syntax in `set()` callbacks: `create<Store>()(immer((set) => ({ ... })))`
- Call actions via `store.getState().action()` in event handlers — never select actions with `useStore((s) => s.action)`. Selectors for state values only.
- Compute derived state inline in `useStore((s) => ...)` selectors — don't store computed selectors as functions in store; calling them outside selector skips subscription
- Wrap array/object-returning selectors with `useShallow` from `zustand/react/shallow` to prevent infinite re-renders: `useStore(useShallow((s) => s.items.filter(...)))`. Without it, new ref on every selector call triggers `useSyncExternalStore` to loop

**Bootstrapping new apps:**
- Use framework's CLI scaffolder, not manual file creation (e.g. `npx vite@<workspace-version> create <name> --template react-ts`)
- Pin to version already in workspace, not latest

## CI/CD

**Pipeline:** `.github/workflows/ci-cd.yml` detects affected apps via `pnpm list -r --filter "...[SHA]"`, runs workspace-wide checks, then calls `.github/workflows/pipeline.yml` per app (ci → e2e → deploy). Deploy gated by presence of `deploy:production` script in app's `package.json`.

## Git Workflow

Don't commit unless explicitly asked — edit files, leave for user review.

## Requirements

Node.js >= 23, npm >= 11.2.0, macOS/Linux only
