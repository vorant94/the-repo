# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing a collection of personal projects, shared libraries, and utility tools. The repository uses npm workspaces with Turbo for build orchestration and Biome for linting/formatting.

## Project Structure

- **apps/** - Personal projects
  - **digital-garden/** - Personal blog built with Astro, deployed to Cloudflare Pages
  - **grimoire/** - Collection of Node scripts for managing MTG (Magic: The Gathering) card collection. Includes scripts for converting between collection management tools (ManaBox to Archidekt) and scraping card staples lists
  - **sofash/** - Early-stage WIP Telegram bot for local weekend events. Currently focused on scraping movie showtimes from local theater networks. Built with Hono and Grammy, uses Drizzle ORM with D1/LibSQL database
  - **subs-savvy/** - Abandoned budget management webapp focused on tracking recurring payments (subscriptions, house bills). React SPA using Dexie (IndexedDB) for client-side storage
- **libs/** - Shared functionality across multiple projects
  - **cn/** - TailwindCSS className utility combining clsx and tailwind-merge
  - **nt/** - NeverThrow wrapper utilities for Result-based error handling
- **tools/** - Utility projects
  - **studio/** - Remotion studio for creating assets (images) for other projects, not a standalone project

## Common Commands

### Root Level

```bash
# Install dependencies
npm install

# Linting (Biome)
npm run lint:check              # Check for lint errors
npm run lint:write              # Fix auto-fixable lint errors
npm run lint:write:unsafe       # Fix with unsafe transformations
npm run lint:ci                 # CI mode (exits with error on violations)

# TypeScript checking (runs across all workspaces)
npx turbo ts:check

# Dependency management
npm run deps-mismatch:check     # Check for version mismatches across workspaces
npm run deps-mismatch:fix       # Fix version mismatches

# Code analysis
npm run unused-code:check       # Check for unused code (Knip)

# Testing (runs across all workspaces)
npx turbo test
```

### digital-garden

```bash
cd apps/digital-garden

npm run start:dev               # Dev server
npm run build                   # Build for production
npm run start:prod              # Preview production build
npm run ts:check                # TypeScript check

# E2E tests (Playwright)
npm run e2e:install             # Install Playwright with deps
npm run e2e                     # Run E2E tests
npm run e2e:ui                  # Run with UI

# Deployment (Cloudflare)
npm run deploy:preview          # Deploy preview
npm run deploy:production       # Deploy to production
```

### grimoire

```bash
cd apps/grimoire

npm run create-wish-and-trade-lists  # Convert ManaBox CSV export to Archidekt format
npm run scrap-paupergeddon-top64     # Scrape Pauper format staples from paupergeddon.com
npm run ts:check                     # TypeScript check
```

### sofash

```bash
cd apps/sofash

npm run start:dev               # Dev server (Vite)
npm run build                   # Build for production
npm run ts:check                # TypeScript check

# Database (Drizzle)
npx drizzle-kit generate        # Generate migration
npx drizzle-kit migrate         # Apply migrations locally
npm run migrate:prod            # Apply migrations to production D1

# Deployment
npm run deploy                  # Deploy to Cloudflare Workers

# Development
npm run proxy:dev               # Start ngrok proxy for local bot testing
```

### subs-savvy

```bash
cd apps/subs-savvy

npm run start:dev               # Dev server (Vite)
npm run build                   # Build for production
npm run ts:check                # TypeScript check

# Testing
npm run test                    # Run Vitest unit tests
npm run test:coverage           # Run with coverage

# E2E tests (Playwright)
npm run e2e:install             # Install Playwright with deps
npm run e2e                     # Run E2E tests
npm run e2e:ui                  # Run with UI

# Deployment
npm run deploy                  # Deploy to Cloudflare Pages
```

### studio

```bash
cd tools/studio

npm run start:dev               # Start Remotion studio
npm run build                   # Build Remotion project
npm run ts:check                # TypeScript check
```

## Architecture Patterns

### sofash - Layered Architecture

Uses a 3-tier layered architecture:
- **api/** - HTTP routes (Hono) and Telegram bot handlers (Grammy)
- **bl/** - Business logic layer
- **dal/** - Data access layer (database queries, external API calls)
- **shared/** - Shared utilities (schema, context, logger, etc.)

The application uses AsyncLocalStorage for request-scoped context management (see src/shared/context/context.ts). Database configuration supports both LibSQL (dev) and Cloudflare D1 (production).

### subs-savvy - Feature-Sliced Design (FSD)

**Note:** This project is abandoned but may serve as a reference for patterns.

Follows FSD architecture:
- **app/** - Application-level providers and root UI
- **pages/** - Page components
- **widgets/** - Complex UI blocks
- **features/** - User interactions and feature logic
- **entities/** - Business entities
- **shared/** - Shared utilities, UI components, API, store

Uses Zustand for state management and Dexie for IndexedDB operations. All database operations follow a pattern: table files expose CRUD functions that parse data with Zod schemas.

### digital-garden - Content-Driven

Astro-based blog with:
- Content collections defined in src/content.config.ts
- Posts stored in src/posts/ with MDX support
- Internationalization with multiple language support
- Custom rehype/remark plugins for markdown processing

### grimoire - Simple Scripts

Collection of standalone Node scripts:
- **export-manabox-to-archidekt.ts** - Parses ManaBox CSV exports using PapaParse and converts to Archidekt format. Outputs separate files for wishlist and bulk cards
- **scrap-pauper-staples.ts** - Scrapes paupergeddon.com using linkedom, extracts card names from HTML, filters out basic lands, and outputs sorted card list

Architecture:
- Flat structure with scripts directly in src/
- Each script is self-contained with configuration at the top
- Uses Zod schemas for CSV validation and type inference
- Output organized by purpose: `output/lists/` for exports, `output/staples/` for scraped data
- Uses Node's experimental `--experimental-strip-types` for direct TypeScript execution

## Development Guidelines

### Code Style (Biome)

This repository enforces strict Biome rules:
- **No default exports** except in config files, main.ts, and Astro files
- **Kebab-case filenames** for all files
- **No barrel files** except for library entry points (libs/*/src/index.ts)
- **No namespace imports** except in test files (for mocking)
- **Sorted Tailwind classes** using the `cn` function
- **No console.log** (use console.error, console.info, or console.debug instead)
- **Array type syntax**: Use `Array<T>` instead of `T[]` (e.g., `Array<string>` not `string[]`)
- **Block statements required**: Always use braces for control flow statements, even single-line ones (e.g., `if (!value) { continue; }` not `if (!value) continue;`)
- **Formatting**: Biome will auto-fix indentation (2 spaces) and other formatting issues with `npm run lint:write`

**IMPORTANT: Always run Biome from repository root:**
- All Biome commands must be run from the repository root, not from individual project directories
- Biome is fast enough to handle the entire monorepo in a single run
- This avoids redundant boilerplate of setting up Biome separately in each project

**Fixing lint errors:**
- Run `npm run lint:write` (from root) to auto-fix safe issues
- Run `npm run lint:write:unsafe` (from root) to apply unsafe fixes (required for array types and block statements)
- Run `npm run lint:check` (from root) to verify all issues are resolved

**Biome-ignore annotations:**
- It is forbidden to "solve" linter warnings by simply ignoring them
- Biome-ignore should only be used for edge cases with external, uncontrollable naming conventions (CSV headers, third-party API responses, etc.)
- Must annotate each non-conforming property individually (interface-level ignores don't work)

### Testing

**subs-savvy** uses Vitest:
- Test files: `*.spec.ts` or `*.spec.tsx`
- Test setup: src/test-setup.ts configures jsdom and fake-indexeddb
- Run single test: `cd apps/subs-savvy && npx vitest run path/to/file.spec.ts`

**digital-garden** uses Playwright for E2E tests.

### Database Migrations (sofash)

1. Update schema files in src/shared/schema/
2. Generate migration: `cd apps/sofash && npx drizzle-kit generate`
3. Apply locally: `npx drizzle-kit migrate`
4. Apply to production D1: `npm run migrate:prod`

Drizzle config points to src/shared/schema for schema definitions and ./drizzle for migrations output.

### Git Hooks (lefthook)

**pre-commit:**
- Runs `npm run lint:ci`
- Runs `npx turbo ts:check`

**pre-push:**
- Runs `npx turbo test`
- Runs `npm run unused-code:check` (Knip)
- Runs `npm run deps-mismatch:check`

## Programming Preferences & Patterns

### Code Philosophy

**Strong preference for simplicity over abstraction:**
- Don't wrap simple native APIs unless there's clear benefit
- Don't create enum-like constants when literals suffice
- Only abstract when there's demonstrated value
- Remove abstractions until they're actually needed

**Minimal dependencies:**
- Only add dependencies when immediately needed (avoid premature additions)
- Reuse existing monorepo dependencies when available
- Prefer native platform APIs over third-party libraries

**Avoid unnecessary exports:**
- Don't export constants/functions that are only used within their file
- Keep module scope minimal - only export what's needed by other files
- Knip will catch unused exports during pre-push checks

**Prefer early returns (guard clauses):**
- ALWAYS check for negative/error conditions first and return/continue early
- Apply this pattern consistently: in functions (early return), in loops (continue), in all nested blocks
- Avoid ALL unnecessary nesting - if you see `if (condition) { doSomething(); }` at the end of a block, use `if (!condition) return/continue;` instead
- Main logic should flow without deep nesting
- Example: `if (!value) continue;` instead of `if (value) { ... }`
- Example: `if (!cardName) continue; cardNames.add(cardName);` instead of `if (cardName) { cardNames.add(cardName); }`

**When initial approach fails:**
- Investigate the reason and present findings as outcome
- Mention possible alternative solutions
- Stop and wait for user response (don't go deep trying to fix it autonomously)

**HTML parsing and string manipulation:**
- Prefer semantic selectors (class names like `card-hover`) over regex patterns
- Prefer simple string methods (`split`, `slice`, `join`) over regex when possible

### TypeScript Patterns

**Type safety with `satisfies`:**
```typescript
// For variables
const format = "Pauper" satisfies Format;

// For enum-like objects
export const Format = {
  pauper: "Pauper",
} as const satisfies Record<string, Format>;
```

**Import patterns:**
- Use type-only imports: `import type { Format }`
- Explicitly import Node built-ins: `import process from "node:process"` (don't rely on globals)
- Prefer `node:` protocol for Node built-ins

**Naming conventions:**
- Use lowerCamelCase for all variables, including constants (e.g., `basicLands`, not `BASIC_LANDS`)
- SCREAMING_CASE creates a false sense of immutability since constant objects are still mutable (properties can be changed)
- Consistent casing makes code more readable and aligns with modern JavaScript conventions

**Modern TypeScript:**
- Top-level await preferred (no main function wrappers)
- `erasableSyntaxOnly: true` means no enums allowed (use type unions + const objects instead)

**Zod schema type inference:**
- Define schema once, infer type from it (DRY principle)
- Schema serves as both runtime validation AND TypeScript type source
```typescript
const rowSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
});

type Row = z.infer<typeof rowSchema>;
```

### CLI Argument Patterns

**Match CLI arg names to schema field names for direct mapping:**
- Use camelCase for CLI argument names (even though kebab-case is traditional in CLI tools)
- This allows direct pass-through from `parseArgs` to Zod without manual mapping
- The simplicity gain outweighs adherence to CLI conventions
```typescript
// Good: Direct pass-through
const { values } = parseArgs({
  options: { deckPathA: { type: "string" } }
});
const { deckPathA } = argsSchema.parse(values);

// Avoid: Manual mapping adds boilerplate
const { values } = parseArgs({
  options: { "deck-path-a": { type: "string" } }
});
const { deckPathA } = argsSchema.parse({
  deckPathA: values["deck-path-a"]
});
```

**Be explicit with variable names from the start:**
- Don't introduce naming transformations mid-flow (avoid `deckA: deckPathA`)
- Name things for what they represent: `deckPathA` (it's a file path) not `deckA` (ambiguous)
- Avoiding destructuring renames makes code easier to trace and search

**Avoid unnecessary validation:**
- Don't add validation constraints that provide no real value
- `z.string()` is sufficient for required string arguments (will fail on undefined)
- Only add `.min()`, `.max()`, `.url()`, etc. when the constraint provides actual safety
```typescript
// Good: Simple and sufficient
const argsSchema = z.object({
  inputPath: z.string().default("input.csv"),
  url: z.string().url().default("https://example.com"), // .url() adds value
});

// Avoid: Unnecessary validation noise
const argsSchema = z.object({
  inputPath: z.string().min(1).default("input.csv"), // .min(1) redundant
});
```

**Consistent patterns across similar scripts:**
- Follow identical structure for similar functionality
- Once you understand one script, you understand them all
- Don't abstract until you have 5+ instances or truly complex shared logic
- Example structure for CLI scripts:
  ```typescript
  // 1. Imports
  // 2. Constants (like basicLands, configuration)
  // 3. CLI argument schema
  // 4. parseArgs call
  // 5. Zod validation
  // 6. Main execution
  ```

### Project Organization

**Future-proof structure:**
- Organize for extensibility even with single implementation
- Group by logical concern (e.g., `sites/mtgdecks/`, `formatters/`)
- Output organized by source: `output/{site}/{format}-staples.txt`

**Configuration clarity:**
- Define configuration variables at top of entry files
- Use clear, explicit variable names
- Centralize behavior changes in one obvious place

### Git Workflow

- Co-authored commits with AI: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- Gitignore generated/output files by default
- Descriptive commit messages focusing on "what" and "why"
- **IMPORTANT: Do not commit files unless explicitly asked.** Edit files and leave them for user review instead.

## Requirements

- **Node.js:** >= 23 (specified in package.json engines)
- **Package manager:** npm >= 11.2.0
- **OS:** macOS or Linux only
