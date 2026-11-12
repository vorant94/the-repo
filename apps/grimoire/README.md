# Grimoire

Node.js CLI for MTG decklists and ManaBox collection exports. Requires Node.js 24
or newer. TypeScript runs directly through Node's built-in type stripping; there
is no build step or runtime loader.

From the repository root:

```sh
pnpm --filter grimoire start --help
pnpm --filter grimoire start merge /path/to/a.txt /path/to/b.txt
pnpm --filter grimoire start compare /path/to/a.txt /path/to/b.txt
pnpm --filter grimoire start compare /path/to/deck.txt /path/to/collection.csv /path/to/tradelist.csv
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
- `compare <file...>` requires at least two inputs: decks, collection CSVs, or a
  mixture of both. Each `.csv` path (case-insensitive) is parsed as a collection;
  other paths are parsed as decklists. Full ManaBox exports and Grimoire's own
  `split` CSV exports are supported. Invalid CSVs report their path and fail before
  output files are written; they never fall back to deck parsing.
  Collection rows are counted by name across printings, foil, languages, and
  binders. All supplied rows count, including lists and proxies; `split` filters
  are not applied. Zero-quantity rows are ignored. Matching is case-sensitive.
  As in the Zig implementation, similarity is the number of copies of cards whose
  names appear in every input, divided by all copies across all inputs. Shared names
  with different quantities contribute all their copies. Empty inputs yield 0%.
  This percentage measures name overlap, rather than how much of a deck a
  collection can supply.
  It also writes `out/shared.txt` and one difference file per input. Deck-only
  runs keep `deck-1-only.txt`, `deck-2-only.txt`, and so on. Runs containing any
  collection use `input-1-only.txt`, `input-2-only.txt`, and so on in input order.
  Shared counts use the minimum quantity of each name across every input;
  differences contain each input's remaining copies. With three or more inputs,
  differences can include names found in some other inputs. Shared cards retain
  the first input's name order; differences retain each input's name order.
  All results are plain `quantity Card Name` text without zones or collection
  metadata. Empty results produce empty files. Override the directory with
  `--outputDir path/to/out`.
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
Papa Parse, and Zod schemas validate arguments and collection records. Supported
finishes are `normal`, `foil`, and `etched`; conditions are `near_mint` and
`light_played`. Supported languages are `en`, `ru`, `ja`, `it`, `de`, `es`, and `fr`.
Existing output files are replaced.

```sh
pnpm --filter grimoire test
pnpm --filter grimoire ts:check
```

The current command behavior comes from the sibling `../grimoire` Zig project.
Historical references in this repository include `f9b78fd` (the original CLI),
`a11b88d^` (the former `merge` and `wish-trade` implementations), and `fa2d551`
(removal of the previous app). The previous `spectate` command is outside this
port's scope.
