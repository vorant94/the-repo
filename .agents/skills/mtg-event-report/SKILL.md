---
name: mtg-event-report
description: Prepare and import Meta Forge event reports from standings files, screenshots, or text, matching current players and archetypes, then generate report images in R2 and return download links after preview approval.
---

# MTG Event Report

Prepare standings, obtain approval of the table, then import the event as JSON, generate its report images in Meta Forge R2, and return download links. Approval authorizes this entire flow unless the user explicitly limits the task (for example, preview only). Do not modify Studio data, generate Studio renders, edit application code, or mutate Meta Forge records outside this import and generation flow.

## Data source and extraction

- Use the standings screenshot or text and event details supplied by the user. Do not inspect or update `tools/studio` data files.
- Transcribe standings in rank order. Use the best full-name capitalization supported by the source.
- Normalize every supplied archetype name before showing the preview. Check all rows for shorthand, color prefixes, spelling, and capitalization; give repeated decks the same normalized name. Preserve an established archetype name when it does not indicate a color, and ask for clarification when a shorthand cannot be expanded reliably.
- Use `Mono-<color letter>` with uppercase `W`, `U`, `B`, `R`, or `G` for single-color decks. Convert explicit color words and abbreviations as well as spaced `Mono` prefixes: `W Convoke` → `Mono-W Convoke`, `Mono W Heroic` → `Mono-W Heroic`, `Red Rally` → `Mono-R Rally`. Expand known shorthand: `Redness` → `Mono-R Madness`, `U Fae` → `Mono-U Faeries`, and mono-green `Elves` → `Mono-G Elves`.
- Name two-color prefixes after Ravnica guilds, regardless of the order of color letters: `WU` Azorius, `UB` Dimir, `BR` Rakdos, `RG` Gruul, `GW` Selesnya, `WB` Orzhov, `UR` Izzet, `BG` Golgari, `RW` Boros, and `GU` Simic. Convert other two-color faction names to the matching guild (for example, `Lorehold Hortimancer` → `Boros Hortimancer`). Keep three-color faction names such as `Esper`, `Jund`, and `Naya`.
- Use the archetype name supplied by the user or screenshot after these normalizations. Do not guess a color identity for names such as `Poison Storm` or `Pinger Tron` without supporting information. Ask for a clear archetype name only when the supplied label is ambiguous enough to make the report unreliable.
- Convert each W/L/D record to numeric `wins`, `losses`, and `draws`. Use `0` for draws when the source omits them.
- Record a requested hidden archetype on that rank with `isArchetypeHidden` set to `true`; otherwise use `false`.
- Meta Forge requires an existing venue. Ask for the venue name if it is missing, and tell the user to create the venue separately if they indicate it does not exist. Resolve its ID from GET `/api/venues` before importing.
- Collect the event name and ISO 8601 date-time with an offset for the JSON import. Default the event name to `Weekly Pauper` only when the user does not supply one.

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
- Match supplied player names against existing `name` and `aliases` values, ignoring case and incidental whitespace. Use the matched record's full `name` in the preview and JSON. A first name can identify a candidate, but do not choose arbitrarily when multiple players match.
- Normalize the supplied archetypes as described above, then match them against existing archetype `name` and `aliases` values. Use the existing canonical `name` for a confident match. Do not substitute a different deck merely because it has a similar name or the player used it previously.
- When venue or deck-history clues can resolve an ambiguous player, list the relevant venue's events with GET `/api/venues/<venue-id>/events`, then query GET `/api/venues/<venue-id>/events/<event-id>/ranks?playerId=<id>` for likely events. Resolve archetypes with GET `/api/archetypes/<id>`. Paginate lists as needed, present the evidence for the match, and ask only if ambiguity remains.
- If a supplied name has no reliable existing match, flag it as a proposed new player or archetype in the preview. Keep clear user-supplied names rather than forcing a match. Resolve ambiguous shorthand with the user before approval.
- If authentication or fetching fails, report the failure and request what is needed to complete matching. Do not claim the lists were checked or silently proceed with an unverified import. These lookups do not authorize creating or updating records.

## Preview and approval

- Before importing, show the parsed standings in a Markdown table with exactly these columns: `rank`, `player`, `archetype`, `wins`, `losses`, `draws`, and `is archetype hidden`.
- State the proposed event name, venue name, and event date-time alongside the preview, including league branding when requested. Explain that approval will import the event (creating missing players and archetypes) and generate the R2 report download links. Meta Forge rejects an unknown venue.
- Wait for explicit approval or corrections before importing. Once approved, complete the remaining flow in the same turn without requesting another confirmation or waiting for "continue". Honor any explicit limits such as preview only or no import.

## Prepare the approved JSON

- Use the same JSON model returned by GET `/api/venues/<venue-id>/events/<event-id>/report`, omitting the server-generated `id`. Do not create a standalone CSV or repository artifact. A temporary JSON request file such as `/tmp/mtg-event-report-request.json` can be used with `curl --json @<path>`.
- Include `name`, `hostedAt`, `isLeagueBranded`, `venue`, and `ranks`. Set `isLeagueBranded` to the requested boolean, or `null` when unspecified. Set `venue.name` to the existing venue's canonical name and `venue.address` to `null`; the import checks the venue name against the event's venue and does not update its address.
- Map preview `rank` to numeric `position`, `player` to `{ "name": "<full player name>" }`, and `archetype` to `{ "name": "<canonical archetype name>" }`. Include numeric `wins`, `losses`, and `draws` and boolean `isArchetypeHidden` on every rank. Use `0` for omitted draws and `false` for visible archetypes. Archetype `aliases` may be omitted; importing does not update aliases.

```json
{
  "name": "Weekly Pauper",
  "hostedAt": "2026-11-23T19:00:00+02:00",
  "isLeagueBranded": null,
  "venue": { "name": "<existing venue name>", "address": null },
  "ranks": [
    {
      "position": 1,
      "player": { "name": "<full player name>" },
      "archetype": { "name": "Mono-U Faeries" },
      "wins": 3,
      "losses": 0,
      "draws": 0,
      "isArchetypeHidden": false
    }
  ]
}
```

## Import, generate, and deliver

Use `curl` for these requests, save responses in temporary JSON files, and inspect them with `jq`. Authenticate API calls with `Authorization: Bearer ${META_FORGE_API_TOKEN}` without printing or saving the token.

1. Create the event with `POST https://meta-forge.vorant94.dev/api/venues/<venue-id>/events`, sending `name`, `hostedAt`, and `isLeagueBranded` from the approved JSON. Save the response and retain its `id`.
2. Import the approved JSON with `POST https://meta-forge.vorant94.dev/api/venues/<venue-id>/events/<event-id>/report` (no trailing slash), using `curl --fail-with-body --silent --show-error --json @/tmp/mtg-event-report-request.json` with the authorization header and `-o /tmp/mtg-event-report-created.json`. The event must have no existing ranks.
3. Queue report generation with `POST https://meta-forge.vorant94.dev/api/venues/<venue-id>/events/<event-id>/report/generate`. Retain the returned job `id`.
4. Poll `GET https://meta-forge.vorant94.dev/api/jobs/<job-id>` until `status` is `completed` or `failed`. While `queued` or `generating`, wait about 5–10 seconds between checks and keep the user informed during longer waits. Allow up to five minutes; if still pending, report the job ID and pending status without creating another job or claiming completion.
5. On completion, inspect `result.pages` for the generated images. Return a clickable download link for each page in order: `https://meta-forge.vorant94.dev/ln/<job-id>/<page-number>` (page numbers start at 1). A legacy result with a single `objectKey` has one page. These public links redirect to signed R2 downloads; prefer them over copying an expiring signed URL or constructing a bucket URL.
6. Lead the final response with the generated report download link(s), labeling pages by their `kind` and page number when there are several. Complete generation after import unless the user explicitly limited the task. Include raw JSON contents or a manual import command only when requested.

Do not blindly retry POST requests after a timeout or uncertain response: inspect saved responses and the current event, report ranks, and job records first. Resume from existing event and job IDs when continuing an interrupted flow. If import or generation fails, report the actual error and stop; do not reimport the report, enqueue repeated jobs, or claim an R2 report exists before generation completes.
