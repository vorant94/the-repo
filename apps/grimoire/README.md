# Grimoire

Node.js CLI for MTG decklists and ManaBox collection exports. Requires Node.js 24
or newer. TypeScript runs directly through Node's built-in type stripping; there
is no build step or runtime loader.

From the repository root:

```sh
pnpm --filter grimoire start --help
pnpm --filter grimoire start merge /path/to/a.txt /path/to/b.txt
pnpm --filter grimoire start compare /path/to/a.txt /path/to/b.txt
pnpm --filter grimoire start split /path/to/ManaBox_Collection.csv
```

These commands run with `apps/grimoire` as the working directory. To use paths
relative to your current directory, invoke the entry point directly:

```sh
node /path/to/the-repo/apps/grimoire/src/main.ts merge a.txt b.txt
```

- `merge <deck...>` totals duplicate entries within each deck, then keeps the
  maximum quantity of each card across decks. It includes sideboards and writes
  an alphabetically sorted decklist to `out/merged.txt`. Override the destination
  with `--outputPath path/to/merged.txt`.
- `compare <deck...>` requires at least two decks and prints similarity to stdout.
  As in the Zig implementation, similarity is the number of copies of cards whose
  names appear in every deck, divided by all copies across all decks. Shared names
  with different quantities contribute all their copies. Empty decks yield 0%.
- `split <collection.csv>` exports all ManaBox `list` entries to `out/wishlist.csv`
  and `binder` entries whose names start with `B3-` to `out/tradelist.csv`. Proxies
  are excluded. Entries combine by name, set code, collector number, foil, and
  language; other metadata comes from the first matching entry. Both outputs omit
  binder name/type columns. Override the directory with `--outputDir path/to/out`.

Decklists use `quantity Card Name` lines. Blank lines and headings are ignored.
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
