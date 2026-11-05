# Grimoire

Node.js CLI for MTG decklists and ManaBox collection exports. Requires Node.js 24
or newer. TypeScript runs directly through Node's built-in type stripping; there
is no build step or runtime loader.

From the repository root:

```sh
pnpm --filter grimoire start --help
pnpm --filter grimoire start merge /path/to/a.txt /path/to/b.txt
pnpm --filter grimoire start compare /path/to/a.txt /path/to/b.txt
pnpm --filter grimoire start normalize /path/to/deck.txt
pnpm --filter grimoire start split /path/to/ManaBox_Collection.csv
```

These commands run with `apps/grimoire` as the working directory. To use paths
relative to your current directory, invoke the entry point directly:

```sh
node /path/to/the-repo/apps/grimoire/src/main.ts merge a.txt b.txt
```

- `merge <deck...>` totals duplicate entries within each deck, then keeps the
  maximum quantity of each card across decks, counting mainboard and sideboard
  copies together. It returns a combined list with all cards in the mainboard and writes
  an alphabetically sorted decklist to `out/merged.txt`. Override the destination
  with `--outputPath path/to/merged.txt`.
- `compare <deck...>` requires at least two decks and prints similarity to stdout.
  As in the Zig implementation, similarity is the number of copies of cards whose
  names appear in every deck, divided by all copies across all decks. Shared names
  with different quantities contribute all their copies. Empty decks yield 0%.
- `split <collection>` exports matching ManaBox `list` entries to `out/wishlist.csv`
  and matching `binder` entries to `out/tradelist.csv`. Binder names must match the
  configured pattern for their destination (see configuration below). Proxies
  are excluded. Entries combine by name, set code, collector number, foil, and
  language; other metadata comes from the first matching entry. Both outputs omit
  binder name/type columns. Override the directory with `--outputDir path/to/out`.
- `normalize <deck>` replaces configured interchangeable cards with preferred
  copies and writes `out/normalized.txt`. Override the destination with
  `--outputPath path/to/normalized.txt`. The initial pair prefers Blue Elemental
  Blast over Hydroblast. Preferred copies fill first, up to four across the whole
  deck; remaining copies use the alternative, also up to four. Mainboard gets
  priority over sideboard. Each card retains its board assignment, and unrelated
  cards keep their quantities. More than eight combined copies are rejected.
  Configure pairs in `src/commands/normalize.ts`.

## Configuration

Grimoire uses one app-wide JSON config file, with settings grouped by command.
The `split` section configures collection exports. Grimoire uses `env-paths` with
the suffix disabled to locate `config.json`:

- Linux: `$XDG_CONFIG_HOME/grimoire/config.json`, defaulting to
  `~/.config/grimoire/config.json`.
- macOS: `~/Library/Preferences/grimoire/config.json`.
- Windows: `%APPDATA%\grimoire\Config\config.json`.

Use `--config path/to/config.json` to select another file. `--help` shows the
default path on your machine. Every command loads and validates the app config
before executing. `--help` works without configuration.

If the file is missing or contains invalid fields, Grimoire prompts for each missing or invalid
field, retrying until the answer is valid. Valid settings are preserved. It saves
the updated config, reloads it, and continues the requested command. Malformed
JSON is reported and rebuilt through the same prompts. Other file read errors
propagate to the CLI error handler. No selection defaults are supplied.

Example configuration:

```json
{
  "split": {
    "tradelist": {
      "binderNamePattern": "^(B3-|Trade-)"
    },
    "wishlist": {
      "binderNamePattern": "^Wishlist$"
    }
  }
}
```

Both pattern strings are required. Patterns use JavaScript regular expression
syntax without `/…/` delimiters or flags and are case-sensitive. Use `|` within a
pattern for alternatives, `"(?!)"` to select nothing, or `".*"` to match every name
of the corresponding binder type.
Zod validates the configuration with `safeParse` and compiles its patterns before
command execution. Regexes are saved as source strings in the JSON file.

## Input formats

Decklists use `quantity Card Name` lines. `Sideboard` marks the sideboard section,
which `normalize` preserves. Other headings and blank lines are ignored.
Inputs must be UTF-8; BOM and CRLF are supported. CSV parsing and formatting use
Papa Parse, and Zod schemas validate arguments and collection records. Collection
enum values follow the Zig implementation, including `near_mint` condition and
languages `en`, `ru`, `ja`, `it`, `de`, `es`, and `fr`. Existing output files are
replaced.

```sh
pnpm --filter grimoire test
pnpm --filter grimoire ts:check
```

The current command behavior comes from the sibling `../grimoire` Zig project.
Historical references in this repository include `f9b78fd` (the original CLI),
`a11b88d^` (the former `merge` and `wish-trade` implementations), and `fa2d551`
(removal of the previous app). The previous `spectate` command is outside this
port's scope.
