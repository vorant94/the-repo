---
name: mtg-event-report
description: Prepare a Meta Forge event-report CSV from standings screenshots or text, matching players and archetypes against current Meta Forge records. Use when preparing an event report for Meta Forge import.
---

# MTG Event Report

Prepare a CSV for Meta Forge's event-report import. Do not modify Studio data, generate Studio renders, or change Meta Forge data or code.

## Data source and extraction

- Use the standings screenshot or text and event details supplied by the user. Do not inspect or update `tools/studio` data files.
- Transcribe standings in rank order. Use the best full-name capitalization supported by the source.
- Normalize every supplied archetype name before showing the preview. Check all rows for shorthand, color prefixes, spelling, and capitalization; give repeated decks the same normalized name. Preserve an established archetype name when it does not indicate a color, and ask for clarification when a shorthand cannot be expanded reliably.
- Use `Mono-<color letter>` with uppercase `W`, `U`, `B`, `R`, or `G` for single-color decks. Convert explicit color words and abbreviations as well as spaced `Mono` prefixes: `W Convoke` → `Mono-W Convoke`, `Mono W Heroic` → `Mono-W Heroic`, `Red Rally` → `Mono-R Rally`. Expand known shorthand: `Redness` → `Mono-R Madness`, `U Fae` → `Mono-U Faeries`, and mono-green `Elves` → `Mono-G Elves`.
- Name two-color prefixes after Ravnica guilds, regardless of the order of color letters: `WU` Azorius, `UB` Dimir, `BR` Rakdos, `RG` Gruul, `GW` Selesnya, `WB` Orzhov, `UR` Izzet, `BG` Golgari, `RW` Boros, and `GU` Simic. Convert other two-color faction names to the matching guild (for example, `Lorehold Hortimancer` → `Boros Hortimancer`). Keep three-color faction names such as `Esper`, `Jund`, and `Naya`.
- Use the archetype name supplied by the user or screenshot after these normalizations. Do not guess a color identity for names such as `Poison Storm` or `Pinger Tron` without supporting information. Ask for a clear archetype name only when the supplied label is ambiguous enough to make the CSV unreliable.
- Convert each W/L/D record to numeric `wins`, `losses`, and `draws`. Use `0` for draws when the source omits them.
- Record a requested hidden archetype on that rank with `isArchetypeHidden` set to `true`; otherwise use `false`.
- Meta Forge requires an existing venue. Ask for the venue name if it is missing, and tell the user to create the venue separately if they indicate it does not exist.
- Collect the event name and ISO 8601 date-time with an offset for the import form. Default the event name to `Weekly Pauper` only when the user does not supply one.

## Match current players and archetypes

- Before showing the preview, fetch the current players and archetypes from Meta Forge using authenticated GET requests. Use `curl` for HTTP requests and `jq` to inspect the responses; do not replace these requests with a Node fetch script. Use the existing `META_FORGE_API_TOKEN` environment variable without printing or saving its value.

```bash
curl --fail-with-body --silent --show-error \
  'https://meta-forge.vorant94.dev/api/players?page=1&pageSize=100' \
  -H "Authorization: Bearer ${META_FORGE_API_TOKEN}" \
  -o /tmp/mtg-event-report-players-1.json
curl --fail-with-body --silent --show-error \
  'https://meta-forge.vorant94.dev/api/archetypes?page=1&pageSize=100' \
  -H "Authorization: Bearer ${META_FORGE_API_TOKEN}" \
  -o /tmp/mtg-event-report-archetypes-1.json
```

- Both endpoints return arrays and support `page` and `pageSize` (maximum 100). Fetch successive pages for each list until a page contains fewer than 100 records. Fetch fresh lists for each new report rather than relying on files from a previous report.
- Match supplied player names against existing `name` and `aliases` values, ignoring case and incidental whitespace. Use the matched record's full `name` in the preview and CSV. A first name can identify a candidate, but do not choose arbitrarily when multiple players match.
- Normalize the supplied archetypes as described above, then match them against existing archetype `name` and `aliases` values. Use the existing canonical `name` for a confident match. Do not substitute a different deck merely because it has a similar name or the player used it previously.
- When venue or deck-history clues can resolve an ambiguous player, use GET `/api/ranks?playerId=<id>&page=1&pageSize=100`, paginate as above, and resolve relevant `eventId` and `archetypeId` values with GET `/api/events/<id>` and `/api/archetypes/<id>`. Match the event's `hostedBy` against GET `/api/venues?page=1&pageSize=100` (paginate as needed). Present the evidence for the match; ask only if ambiguity remains.
- If a supplied name has no reliable existing match, flag it as a proposed new player or archetype in the preview. Keep clear user-supplied names rather than forcing a match. Resolve ambiguous shorthand with the user before approval.
- If authentication or fetching fails, report the failure and request what is needed to complete matching. Do not claim the lists were checked or silently proceed with an unverified final CSV. These lookups do not authorize creating or updating records.

## Preview and approval

- Before producing the final CSV, show the parsed standings in a Markdown table with exactly these columns: `rank`, `player`, `archetype`, `wins`, `losses`, `draws`, and `is archetype hidden`.
- State the proposed event name, venue name, and event date-time alongside the preview.
- Wait for explicit approval or corrections. Do not create database records or edit application files.

## CSV handoff

- After approval, save the CSV in the repository root as `event-report-YYYY-MM-DD-<venue-slug>.csv`, using the event's local date and a lowercase kebab-case venue slug. Do this automatically; do not wait for a separate request to create the file.
- Return the saved file as a clickable link and include its contents in a fenced `csv` block with this exact header and order: `rank,player,archetype,wins,losses,draws,isArchetypeHidden`.
- Include all seven columns for every row, including `draws` with `0` where appropriate and `isArchetypeHidden` as lowercase `true` or `false`. Quote CSV values when required by CSV syntax.
- Do not include IDs, venue details, event details, or extra columns in the CSV. The import form receives `eventName`, `venueName`, and `eventDate` separately.
- Provide a ready-to-run `curl` snippet that imports the saved file with `POST https://meta-forge.vorant94.dev/api/event-reports` (no trailing slash). Use multipart fields `eventName`, `venueName`, `eventDate`, and `report`, and authenticate with `Authorization: Bearer ${META_FORGE_API_TOKEN}`. Do not execute the import unless the user explicitly asks.
- State that Meta Forge creates missing players and archetypes during import, but rejects an unknown venue.
