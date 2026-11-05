# Grimoire

Node.js CLI for MTG decklists and ManaBox collection exports. Workspace name: `grimoire`.

## Runtime

- Run TypeScript directly with Node.js 24+ type stripping. There is no build step or runtime loader.
- Use the built-in Node.js test runner: `pnpm --filter grimoire test`, or `test:watch` for watch mode.
- This is a CLI; do not add an application watch/start-dev script.

## Data and Command Boundaries

- Configuration is an app-wide JSON file with command-specific sections. Before command dispatch, the CLI locates it through `env-paths` or `--config` and validates it with Zod `safeParse`. Treat a missing config file as an empty config. Report malformed JSON and rebuild it through field prompts. Prompt for missing or invalid fields, preserve valid settings, save the updated config, reload it, and continue execution. Let other file read errors propagate. `--help` bypasses setup. Store regex source strings in JSON.
- Parsers convert text into domain records; formatters convert records into text. The CLI handles reading, parsing, formatting, and writing.
- Command functions accept domain records and return records or scalar results. Keep input/output formatting and filesystem operations out of commands.
- `DeckCard` represents one copy with a name and zone. Deck parsing preserves individual copies, order, and mainboard/sideboard placement. Counting is a separate operation.
- `merge` accepts decks, counts internally, and returns one deck. Ignore zones when counting: combine mainboard and sideboard copies within each input deck, then keep the maximum total per card across decks. The combined result uses `mainboard` for all records.
- `compare` accepts decks and returns an unrounded similarity percentage from 0 to 100. Count all copies whose names occur in every deck, divided by all copies across all decks. The CLI rounds the displayed percentage.
- Run command dispatch inside `configContext.run` with the loaded and parsed app config. Functions that need configuration call `getConfig()` instead of passing config through the call stack. Tests establish their own config context.
- `split` accepts a parsed collection and returns `[tradelist, wishlist]` as arrays of collection records. Selection rules belong in `isWishlistCard` and `isTradelistCard`, which read config from context. Match configured binder name patterns with `list` for wishlist and `binder` for tradelist, excluding proxies. Do not supply selection defaults.
- `normalize` accepts and returns deck records. Replacement pairs define preferred cards; fill preferred copies first, up to four across both boards, with mainboard taking priority. Keep each copy's zone and preserve the total number of copies. Reject pair totals that cannot fit within four copies of each card. Use the configured pairs in `src/commands/normalize.ts` as the source of truth.
- Do not mutate caller-owned records while normalizing or aggregating.
