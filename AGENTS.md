# AGENTS.md

Guidance to AI Agents for this repo.

## Repository Overview

Monorepo: pnpm workspaces, Biome for linting and formatting (including Markdown and YAML).

**Structure:**

- `apps/digital-garden` - Astro blog (Cloudflare Pages)
- `apps/meta-forge` - MTG tournament data tool (Hono, Drizzle ORM, Cloudflare Workers)
- `apps/grimoire` - Node.js CLI for MTG decklists and ManaBox collections
- `tools/studio` - Remotion studio for asset generation

## Instruction Scope

- Before working in a package, read its `AGENTS.md` and any intermediate `AGENTS.md` files along the path from the repository root. This also applies when the session starts at the repository root or the task spans multiple packages.
- Load instructions and referenced documents only for packages and technologies relevant to the task. Do not preload sibling packages' instructions or all reference documents.
- For Meta Forge API requests, read [Meta Forge instructions](apps/meta-forge/AGENTS.md), even when the request originates outside that package.
- When writing or modifying React components, read [React patterns](docs/agents/react.md). When writing or modifying Zustand stores or consumers, read [Zustand patterns](docs/agents/zustand.md).
- When writing, modifying, or reviewing unit tests, or fixing a bug, read [Unit testing preferences](docs/agents/unit-testing.md).
- When writing, modifying, or reviewing Zod schemas or validation, read [Zod preferences](docs/agents/zod.md).
- Keep repository-wide rules here, package-specific rules in that package's `AGENTS.md`, and shared technology-specific details in conditional references.

## Commands

**Workspace names:** Packages use bare names (e.g. `meta-forge`), not `@app/`/`@lib/` scoping. Always check `name` field in target `package.json` before `pnpm --filter <name>`.

**Internal lib dependencies:** Reference workspace libs with workspace protocol (e.g. `"nt": "workspace:*"`).

**Root:**

```bash
pnpm install
pnpm run lint:check|write|write:unsafe|ci  # Biome linting and formatting (always run from root)
pnpm -r run --if-present ts:check          # TypeScript across workspaces
pnpm run unused-code:check                 # Knip unused code analysis
```

**Codex pnpm access:** Run dependency-mutating pnpm commands (`install`, `add`, `remove`, `up`, `update`, `fetch`) escalated on first attempt. The sandbox cannot write the user-level pnpm store backing the existing `node_modules`, which otherwise causes `ERR_PNPM_UNEXPECTED_STORE`. Escalation does not require or imply a preceding `pnpm install`; run only the requested command. Run existing project scripts sandboxed unless they need other restricted access.

**Common per-project:** Most apps support `start:dev`, `build`, `ts:check`. E2E projects add `e2e:install`, `e2e`, `e2e:ui`. Deploy commands vary by platform (Cloudflare Pages/Workers).

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

## Git Hooks (lefthook)

**pre-commit:** `pnpm run lint:ci`, `pnpm -r run --if-present ts:check`
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
- Prefer built-in coercion and defaults. Add restrictions only when required by the domain or explicitly requested.
- Preserve domain data, information, and business rules when porting or refactoring. Do not discard fields or combine parsing with aggregation just because current callers do not need the original records.
- Compute invariant mappings, keys, headers, and configuration at module scope. Functions should compute only what depends on their arguments.
- Apply requested patterns consistently across the affected code, including removing redundant variables, helpers, imports, and tests.
- Treat explanatory questions as questions. Do not change something merely because the user asks why it exists.
- Do not write code scripts for single-use actions. Use existing CLI tools directly; use `curl` for HTTP requests and store fetched data in temporary JSON files. Use `jq` to inspect and transform JSON.
- When a reusable automation script is needed, use Node, not Python.
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
```

**Naming:** lowerCamelCase for all variables including constants (`basicLands` not `BASIC_LANDS`). SCREAMING_CASE implies false immutability — objects stay mutable. Environment variable names are an exception: preserve their SCREAMING_SNAKE_CASE names across the codebase, including Zod schemas and parsed environment objects, and add a narrowly scoped `biome-ignore lint/style/useNamingConvention` comment where required.

**Modern TypeScript:** Top-level await (no main wrappers). No enums (`erasableSyntaxOnly: true`) — use type unions + const objects.

**CLI patterns:**

- camelCase CLI args matching schema fields for direct `parseArgs` → Zod pass-through
- Don't rename in destructuring — name things right from start
- Consistent structure: imports → constants → schema → parseArgs → validation → execution
- Don't abstract until 5+ instances or truly complex shared logic

**Project organization:**

- Organize for extensibility even with single implementation
- Define config vars at top of entry files
- Use clear, explicit variable names
- Non-exported entities (constants, helpers) go after all exported entities in file
- One component per file — never define multiple components (exported or local) in same file

**Bootstrapping new apps:**

- Use framework's CLI scaffolder, not manual file creation (e.g. `npx vite@<workspace-version> create <name> --template react-ts`)
- Pin to version already in workspace, not latest

## CI/CD

**Pipeline:** GitHub Actions workflows at `.github/workflows/ci-cd.yml` and `.github/workflows/pipeline.yml` detect affected apps via `pnpm list -r --filter "...[SHA]"`, run workspace checks (Biome, tests, code generation, unused-code), then run per-app CI → E2E → deploy. Deploy is gated by the presence of a `deploy:production` script in the app's `package.json`.

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
