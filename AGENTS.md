# AGENTS.md

Guidance to AI Agents for this repo.

## Repository Overview

Monorepo: pnpm workspaces, Biome for linting, Prettier for Markdown/YAML formatting.

**Structure:**

- `apps/digital-garden` - Astro blog (Cloudflare Pages)
- `apps/meta-forge` - MTG tournament data tool (Hono, Drizzle ORM, Cloudflare Workers)
- `tools/studio` - Remotion studio for asset generation

## Commands

**Workspace names:** Packages use bare names (e.g. `meta-forge`), not `@app/`/`@lib/` scoping. Always check `name` field in target `package.json` before `pnpm --filter <name>`.

**Internal lib dependencies:** Reference workspace libs with workspace protocol (e.g. `"nt": "workspace:*"`).

**Root:**

```bash
pnpm install
pnpm run lint:check|write|write:unsafe|ci  # Biome linting (always run from root)
pnpm run prettier:check|write              # Prettier checks/writes only Markdown and YAML (always run from root)
pnpm -r run --if-present ts:check          # TypeScript across workspaces
pnpm run unused-code:check                 # Knip unused code analysis
```

**Codex pnpm access:** Run dependency-mutating pnpm commands (`install`, `add`, `remove`, `up`, `update`, `fetch`) escalated on first attempt. The sandbox cannot write the user-level pnpm store backing the existing `node_modules`, which otherwise causes `ERR_PNPM_UNEXPECTED_STORE`. Escalation does not require or imply a preceding `pnpm install`; run only the requested command. Run existing project scripts sandboxed unless they need other restricted access.

**Common per-project:** Most apps support `start:dev`, `build`, `ts:check`. E2E projects add `e2e:install`, `e2e`, `e2e:ui`. Deploy commands vary by platform (Cloudflare Pages/Workers).

**D1 migrations:** Drizzle Kit uses the SQLite dialect for D1 and has no config option to generate D1-specific migration SQL. Review generated migrations that rebuild tables or change foreign keys: D1 enforces foreign keys inside implicit transactions, so `PRAGMA foreign_keys=OFF` does not disable them. `PRAGMA defer_foreign_keys=ON` only postpones validation until the transaction ends; all references must be valid then. Rewrite incompatible migrations and apply them to a disk-backed local D1 database with representative rows and foreign keys before production. An empty database migration run does not prove that existing data will migrate successfully. Do not rename migration files after they have been applied; Wrangler records their filenames in `d1_migrations`.

**Cloudflare SSR headers:** Some projects have two CSP sources: `public/_headers` covers static assets, while Worker or framework middleware must set the equivalent header on SSR/API responses. Keep both policies in sync when changing CSP.

## Architecture

**digital-garden:** Astro content collections in src/content.config.ts, posts in src/posts/, i18n, custom rehype/remark plugins.

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

- Playwright E2E tests for digital-garden run through its app pipeline.

## Git Hooks (lefthook)

**pre-commit:** `pnpm run lint:ci`, `pnpm run prettier:check`, `pnpm -r run --if-present ts:check`
**pre-push:** `pnpm -r run --if-present ts:codegen && pnpm run unused-code:check`

## Programming Preferences

**Philosophy:**

- Simplicity over abstraction — remove abstractions until needed
- Minimal dependencies — prefer native APIs, reuse monorepo deps
- Only export what other files need (Knip catches unused exports)
- Early returns always: `if (!value) { return; }` not `if (value) { ... }` — all contexts including small functions, disposal handlers
- Avoid unnecessary nesting — main logic flows without deep nesting
- Keep distinct actions in separate statements — extract and validate inputs before using them in queries or other operations
- When approach fails: investigate, present findings, stop and wait
- Prefer library-native APIs over custom workarounds — check library first before implementing
- Always use Node for any throwaway or automation scripts in this repo (`node -e 'console.log("workspace-ok")'` or a Node script, not Python).
- Use `dedent` for multiline strings (proper indentation in source, removed at runtime)
- Prefer optional chaining (`?.`) over explicit null/undefined checks when supported
- Use `null` for explicit "nothing", not `undefined` — `undefined` for implicit absence (optional params)
- Don't add default values to optional params when implicit `undefined` acceptable: `param?: Type` not `param?: Type = defaultValue`

**HTML parsing:** Prefer semantic selectors (class names) over regex, simple string methods over regex when possible.

**TypeScript:**

```typescript
// satisfies for type safety
const format = "Pauper" satisfies Format;
export const Format = { pauper: "Pauper" } as const satisfies Record<
  string,
  Format
>;

// interface for objects, type for unions
export interface TempDir {
  path: string;
  cleanup: () => Promise<void>;
}
type Status = "pending" | "completed";

// Optional properties/params: use ?: not | undefined
export interface Foo {
  title?: string;
} // not title: string | undefined
function bar(title?: string) {} // not title: string | undefined

// Optional and nullable: parameters can be both
function baz(debugFileName?: string | null) {} // accepts string, null, or undefined (omitted)

// Type-only imports, explicit node: protocol
import type { Format } from "./types";
import process from "node:process";

// Zod: schema once, infer type, export both
const rowSchema = z.object({ name: z.string(), value: z.number() });
type Row = z.infer<typeof rowSchema>;

// Use type aliases instead of inline inference
export const chapterSchema = z.object({ title: z.string() });
export type Chapter = z.infer<typeof chapterSchema>; // export and reuse everywhere
// NOT: Array<z.infer<typeof chapterSchema>> at each usage site
```

**Zod parsing:** Always use `.parse()` by default and let validation errors throw. NEVER use `.safeParse()` unless the user explicitly asks for it.

**Naming:** lowerCamelCase for all variables including constants (`basicLands` not `BASIC_LANDS`). SCREAMING_CASE implies false immutability — objects stay mutable. Environment variable names are an exception: preserve their SCREAMING_SNAKE_CASE names across the codebase, including Zod schemas and parsed environment objects, and add a narrowly scoped `biome-ignore lint/style/useNamingConvention` comment where required.

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

**React patterns:**

- For components with children, define interface with only component-specific props, apply `PropsWithChildren` at component type level:

```typescript
interface UserProviderProps {
  user?: User | null;
}
export const UserProvider: FC<PropsWithChildren<UserProviderProps>> = ({ user, children }) => { ... };
```

- Never add `children?: ReactNode` to the props interface—use `PropsWithChildren` wrapper instead
- Never use type aliases for props—always use interfaces

**Zustand patterns:**

- Use `immer` middleware (`zustand/middleware/immer`) for mutable update syntax in `set()` callbacks: `create<Store>()(immer((set) => ({ ... })))`
- Call actions via `store.getState().action()` in event handlers — never select actions with `useStore((s) => s.action)`. Selectors for state values only.
- Compute derived state inline in `useStore((s) => ...)` selectors — don't store computed selectors as functions in store; calling them outside selector skips subscription
- Wrap array/object-returning selectors with `useShallow` from `zustand/react/shallow` to prevent infinite re-renders: `useStore(useShallow((s) => s.items.filter(...)))`. Without it, new ref on every selector call triggers `useSyncExternalStore` to loop

**Bootstrapping new apps:**

- Use framework's CLI scaffolder, not manual file creation (e.g. `npx vite@<workspace-version> create <name> --template react-ts`)
- Pin to version already in workspace, not latest

## CI/CD

**Pipeline:** GitHub Actions workflows at `.github/workflows/ci-cd.yml` and `.github/workflows/pipeline.yml` detect affected apps via `pnpm list -r --filter "...[SHA]"`, run workspace checks (Biome, Prettier Markdown/YAML check, tests, code generation, unused-code), then run per-app CI → E2E → deploy. Deploy is gated by the presence of a `deploy:production` script in the app's `package.json`.

## Git Workflow

Don't commit unless explicitly asked — edit files, leave for user review.

NEVER co-sign commits. No `Co-Authored-By` trailer, no "Generated with Claude Code", no agent attribution of any kind. You are a tool, not an author.

<!-- context7 -->

Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and the user's full question (not single words), scoped to a single concept. If the question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic
4. Answer using the fetched docs

<!-- context7 -->
